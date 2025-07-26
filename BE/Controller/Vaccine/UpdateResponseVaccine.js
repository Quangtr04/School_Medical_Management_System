const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const sendNotification = require("../../Utils/sendNotification");

const UpdateResponseByManager = async (req, res, next) => {
  try {
    const { campaign_id } = req.params;
    const { status, note } = req.body;

    if (!["APPROVED", "DECLINED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'APPROVED' or 'DECLINED'." });
    }

    const pool = await sqlServerPool;

    const campaign = await pool
      .request()
      .input("campaign_id", sql.Int, campaign_id)
      .query("SELECT * FROM Vaccination_Campaign WHERE campaign_id = @campaign_id");

    if (campaign.recordset.length === 0) {
      return res.status(404).json({ message: "Vaccination campaign not found." });
    }

    const { approval_status, created_by, class: className } = campaign.recordset[0];

    if (approval_status === "APPROVED" && status === "APPROVED") {
      return res.status(400).json({ message: "Campaign already approved." });
    }

    // ✅ Cập nhật trạng thái
    await pool
      .request()
      .input("campaign_id", sql.Int, campaign_id)
      .input("status", sql.VarChar, status)
      .query("UPDATE Vaccination_Campaign SET approval_status = @status WHERE campaign_id = @campaign_id");

    if (status === "DECLINED") {
      await pool.request().input("campaign_id", sql.Int, campaign_id).query(`
        DELETE FROM Vaccination_Result WHERE campaign_id = @campaign_id;
        DELETE FROM Vaccination_Consent_Form WHERE campaign_id = @campaign_id;
      `);

      await sendNotification(
        pool,
        created_by,
        "Chiến dịch tiêm chủng bị từ chối",
        `Chiến dịch tiêm bạn tạo đã bị từ chối bởi quản lý vì lý do: ${note}.`
      );
    }

    if (status === "APPROVED") {
      await sendNotification(
        pool,
        created_by,
        "Chiến dịch tiêm chủng được duyệt",
        `Chiến dịch tiêm chủng cho lớp ${className} đã được duyệt.`
      );

      const students = await pool
        .request()
        .input("class_name", sql.NVarChar, className)
        .query("SELECT student_id, parent_id FROM Student_Information WHERE class_name = @class_name");

      for (let stu of students.recordset) {
        await pool
          .request()
          .input("campaign_id", sql.Int, campaign_id)
          .input("student_id", sql.Int, stu.student_id)
          .input("parent_id", sql.Int, stu.parent_id).query(`
            INSERT INTO Vaccination_Consent_Form (campaign_id, student_id, parent_id, status)
            VALUES (@campaign_id, @student_id, @parent_id, 'PENDING')
          `);

        await sendNotification(
          pool,
          stu.parent_id,
          "Xác nhận tiêm chủng",
          `Vui lòng xác nhận chiến dịch tiêm chủng cho học sinh lớp ${className}.`
        );
      }
    }

    res.status(200).json({ message: "Campaign response updated successfully." });
  } catch (error) {
    console.error("UpdateResponseByManager error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const UpdateResponseByParent = async (req, res, next) => {
  try {
    const parent_id = req.user?.user_id;
    const { form_id } = req.params;
    const { status, note } = req.body;

    if (!["AGREED", "DECLINED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value. Must be 'AGREED' or 'DECLINED'." });
    }

    const pool = await sqlServerPool;

    const vaccineExist = await pool.request().input("form_id", sql.Int, form_id).input("parent_id", sql.Int, parent_id)
      .query(`
        SELECT * FROM Vaccination_Consent_Form
        WHERE form_id = @form_id AND parent_id = @parent_id
      `);

    if (vaccineExist.recordset.length === 0) {
      return res.status(404).json({ message: "Consent form not found." });
    }

    const consentForm = vaccineExist.recordset[0];

    if (consentForm.status === "AGREED" && status === "AGREED") {
      return res.status(400).json({ message: "Already agreed." });
    }

    // Cập nhật trạng thái
    await pool
      .request()
      .input("status", sql.VarChar, status)
      .input("form_id", sql.Int, form_id)
      .input("parent_id", sql.Int, parent_id)
      .input("submit_at", sql.DateTime, new Date())
      .input("note", sql.NVarChar, note || "").query(`
        UPDATE Vaccination_Consent_Form
        SET status = @status, submitted_at = @submit_at, note = @note
        WHERE form_id = @form_id AND parent_id = @parent_id
      `);

    const nurseId = await pool.request().input("campaign_id", sql.Int, consentForm.campaign_id).query(`
      SELECT created_by FROM Vaccination_Campaign WHERE campaign_id = @campaign_id
    `);

    if (status === "DECLINED") {
      // Xóa kết quả tiêm nếu đã từng có
      await pool.request().input("form_id", sql.Int, form_id).query(`
          DELETE FROM Vaccination_Result
          WHERE consent_form_id = @form_id
        `);

      // Gửi thông báo cho y tá
      if (nurseId) {
        await sendNotification(
          pool,
          nurseId.recordset[0].created_by,
          "Lịch tiêm chủng bị từ chối",
          `Phụ huynh đã từ chối tiêm chủng cho con. Lý do: ${note}`
        );
      }
    }

    if (status === "AGREED") {
      // Chèn vào Vaccination_Result nếu chưa tồn tại
      await pool
        .request()
        .input("campaign_id", sql.Int, consentForm.campaign_id)
        .input("student_id", sql.Int, consentForm.student_id)
        .input("consent_form_id", sql.Int, consentForm.form_id).query(`
          IF NOT EXISTS (
            SELECT 1 FROM Vaccination_Result
            WHERE campaign_id = @campaign_id AND student_id = @student_id
          )
          BEGIN
            INSERT INTO Vaccination_Result (campaign_id, student_id, consent_form_id, vaccinated_at, vaccine_name, dose_number, reaction, follow_up_required, note)
            VALUES (@campaign_id, @student_id, @consent_form_id, NULL, NULL, NULL, NULL, NULL, NULL)
          END
        `);

      // Gửi thông báo cho y tá
      await sendNotification(
        pool,
        nurseId.recordset[0].created_by,
        "Xác nhận tiêm chủng",
        "Phụ huynh đã đồng ý tiêm chủng cho học sinh."
      );
    }

    res.status(200).json({ message: "Phản hồi của phụ huynh đã được cập nhật." });
  } catch (error) {
    console.error("Error in UpdateResponseByParent:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  UpdateResponseByManager,
  UpdateResponseByParent,
};
