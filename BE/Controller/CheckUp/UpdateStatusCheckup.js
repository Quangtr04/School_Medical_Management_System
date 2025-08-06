const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const sendNotification = require("../../Utils/sendNotification");

const UpdateStatusCheckupByManager = async (req, res) => {
  const { checkup_id } = req.params;
  const { status, response } = req.body;

  if (!["APPROVED", "DECLINED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value. Must be 'APPROVED' or 'DECLINED'." });
  }

  try {
    const pool = await sqlServerPool;

    // 🔍 Kiểm tra lịch khám có tồn tại
    const checkExist = await pool
      .request()
      .input("checkup_id", sql.Int, checkup_id)
      .query("SELECT * FROM Medical_Checkup_Schedule WHERE checkup_id = @checkup_id");

    if (checkExist.recordset.length === 0) {
      return res.status(404).json({ message: "Checkup not found." });
    }

    // Nếu đã duyệt rồi mà lại tiếp tục duyệt thì báo lỗi
    if (checkExist.recordset[0].approval_status === "APPROVED" && status === "APPROVED") {
      return res.status(400).json({ message: "Checkup already approved." });
    }

    // ✅ Cập nhật trạng thái
    await pool
      .request()
      .input("status", sql.NVarChar, status)
      .input("checkup_id", sql.Int, checkup_id)
      .input("response", sql.NVarChar, response ?? null)
      .query(
        "UPDATE Medical_Checkup_Schedule SET approval_status = @status, response = @response WHERE checkup_id = @checkup_id"
      );

    const nurseId = checkExist.recordset[0].created_by;
    const className = checkExist.recordset[0].class;

    // ❌ Nếu bị từ chối
    if (status === "DECLINED") {
      // Xóa dữ liệu liên quan
      await pool.request().input("checkup_id", sql.Int, checkup_id).query(`
        DELETE FROM Checkup_Participation WHERE checkup_id = @checkup_id;
        DELETE FROM Checkup_Consent_Form WHERE checkup_id = @checkup_id;
      `);

      // Gửi thông báo cho Nurse
      if (nurseId) {
        await sendNotification(
          pool,
          nurseId,
          "Lịch khám bị từ chối",
          `Lịch khám sức khỏe bạn tạo đã bị từ chối bởi quản lý bởi lý do ${response}.`
        );
      }
    }

    // ✅ Nếu được duyệt
    if (status === "APPROVED") {
      // Gửi thông báo đến Nurse
      if (nurseId) {
        await sendNotification(
          pool,
          nurseId,
          "Lịch khám được duyệt",
          `Lịch khám sức khỏe cho lớp ${className} đã được duyệt.`
        );
      }

      // Lấy danh sách học sinh và phụ huynh theo class
      const students = await pool.request().input("class", sql.Int, className).query(`
        SELECT student_id, parent_id FROM Student_Information
        WHERE class_name LIKE CAST(@class AS NVARCHAR) + '%'
      `);

      for (let stu of students.recordset) {
        // Tạo consent form cho mỗi học sinh
        await pool
          .request()
          .input("student_id", sql.Int, stu.student_id)
          .input("parent_id", sql.Int, stu.parent_id)
          .input("checkup_id", sql.Int, checkup_id).query(`
            INSERT INTO Checkup_Consent_Form (student_id, parent_id, checkup_id, status, submitted_at)
            VALUES (@student_id, @parent_id, @checkup_id, 'PENDING', NULL)
          `);

        // Gửi thông báo cho phụ huynh
        await sendNotification(
          pool,
          stu.parent_id,
          "Cần xác nhận lịch khám sức khỏe",
          `Vui lòng xác nhận lịch khám sức khỏe cho học sinh lớp ${className}.`
        );
      }
    }

    res.status(200).json({ message: "Checkup status updated successfully." });
  } catch (error) {
    console.error("Error updating checkup status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const UpdateStatusCheckupParent = async (req, res) => {
  const { checkup_id } = req.params;
  const parent_id = req.user?.user_id;
  const { status, note } = req.body;

  if (!["APPROVED", "DECLINED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value. 'APPROVED' or 'DECLINED'." });
  }

  try {
    const pool = await sqlServerPool;

    // Kiểm tra consent form tồn tại không
    const checkExist = await pool
      .request()
      .input("checkup_id", sql.Int, checkup_id)
      .input("parent_id", sql.Int, parent_id).query(`
        SELECT * FROM Checkup_Consent_Form
        WHERE checkup_id = @checkup_id AND parent_id = @parent_id
      `);

    if (checkExist.recordset.length === 0) {
      return res.status(404).json({ message: "Consent form not found." });
    }

    // Cập nhật trạng thái
    await pool
      .request()
      .input("status", sql.NVarChar, status)
      .input("checkup_id", sql.Int, checkup_id)
      .input("note", sql.NVarChar, note)
      .input("parent_id", sql.Int, parent_id)
      .input("updated_at", sql.DateTime, new Date()).query(`
        UPDATE Checkup_Consent_Form
        SET status = @status, submitted_at = GETDATE(), note = @note, updated_at = @updated_at
        WHERE checkup_id = @checkup_id AND parent_id = @parent_id
      `);

    // Nếu từ chối thì xóa Checkup_Participation liên quan
    if (status === "DECLINED") {
      // Xóa Checkup_Participation
      await pool.request().input("checkup_id", sql.Int, checkup_id).input("parent_id", sql.Int, parent_id).query(`
      DELETE CP
      FROM Checkup_Participation CP
      INNER JOIN Checkup_Consent_Form CF ON CP.consent_form_id = CF.form_id
      WHERE CF.checkup_id = @checkup_id AND CF.parent_id = @parent_id
  `);

      // Gửi thông báo cho Nurse
      const nurseResult = await pool.request().input("checkup_id", sql.Int, checkup_id).query(`
    SELECT created_by FROM Medical_Checkup_Schedule WHERE checkup_id = @checkup_id
  `);
      const nurseId = nurseResult.recordset[0]?.created_by;
      if (nurseId) {
        await sendNotification(
          pool,
          nurseId,
          "Phụ huynh từ chối khám sức khỏe",
          `Một phụ huynh đã từ chối cho con em tham gia khám sức khỏe vì lý do ${note}.`
        );

        const emailNurse = await pool
          .request()
          .input("user_id", sql.Int, nurseId)
          .query("SELECT email FROM Users WHERE user_id = @user_id");

        await sendEmail(
          emailNurse.recordset[0].email,
          "Phụ huynh từ chối khám sức khỏe",
          `Một phụ huynh đã từ chối cho con em tham gia khám sức khỏe vì lý do ${note}.`
        );
      }
    }

    if (status === "AGREED") {
      // 🔄 Xóa Checkup_Participation cũ (nếu có)
      await pool.request().input("checkup_id", sql.Int, checkup_id).input("parent_id", sql.Int, parent_id).query(`
      DELETE CP
      FROM Checkup_Participation CP
      INNER JOIN Checkup_Consent_Form CF ON CP.consent_form_id = CF.form_id
      WHERE CF.checkup_id = @checkup_id AND CF.parent_id = @parent_id
    `);

      // 🔍 Lấy lại form_id + student_id
      const formInfo = await pool
        .request()
        .input("checkup_id", sql.Int, checkup_id)
        .input("parent_id", sql.Int, parent_id).query(`
      SELECT form_id, student_id
      FROM Checkup_Consent_Form
      WHERE checkup_id = @checkup_id AND parent_id = @parent_id
    `);

      if (formInfo.recordset.length > 0) {
        const { form_id, student_id } = formInfo.recordset[0];

        // ✅ Thêm mới Checkup_Participation
        await pool
          .request()
          .input("checkup_id", sql.Int, checkup_id)
          .input("student_id", sql.Int, student_id)
          .input("consent_form_id", sql.Int, form_id).query(`
        INSERT INTO Checkup_Participation (checkup_id, student_id, consent_form_id)
        VALUES (@checkup_id, @student_id, @consent_form_id)
      `);

        // 🔔 Gửi thông báo cho Nurse
        const nurseResult = await pool.request().input("checkup_id", sql.Int, checkup_id).query(`
        SELECT created_by FROM Medical_Checkup_Schedule WHERE checkup_id = @checkup_id
      `);

        const nurseId = nurseResult.recordset[0]?.created_by;
        if (nurseId) {
          await sendNotification(
            pool,
            nurseId,
            "Phụ huynh đồng ý khám sức khỏe",
            "Một phụ huynh đã đồng ý cho con em tham gia khám sức khỏe."
          );

          const emailNurse = await pool
            .request()
            .input("user_id", sql.Int, nurseId)
            .query("SELECT email FROM Users WHERE user_id = @user_id");

          await sendEmail(
            emailNurse.recordset[0].email,
            "Phụ huynh đồng ý khám sức khỏe",
            "Một phụ huynh đã đồng ý lại lịch khám sức khỏe cho con em."
          );
        }
      }
    }

    res.status(200).json({ message: "Checkup consent updated successfully." });
  } catch (error) {
    console.error("Error updating checkup consent status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { UpdateStatusCheckupByManager, UpdateStatusCheckupParent };
