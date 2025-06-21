const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const sendNotification = require("../../Utils/sendNotification");

const UpdateStatusCheckupByManager = async (req, res) => {
  const { checkup_id } = req.params;
  const { status } = req.body;

  if (!["APPROVED", "DECLINED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value. 'APPROVED' or 'DECLINED'." });
  }

  try {
    const pool = await sqlServerPool;

    // Kiểm tra lịch khám có tồn tại không
    const checkExist = await pool
      .request()
      .input("checkup_id", sql.Int, checkup_id)
      .query("SELECT * FROM Medical_Checkup_Schedule WHERE checkup_id = @checkup_id");

    if (checkExist.recordset.length === 0) {
      return res.status(404).json({ message: "Checkup not found." });
    }

    // Cập nhật trạng thái
    await pool
      .request()
      .input("status", sql.NVarChar, status)
      .input("checkup_id", sql.Int, checkup_id)
      .query("UPDATE Medical_Checkup_Schedule SET approval_status = @status WHERE checkup_id = @checkup_id");

    // Nếu bị từ chối, xóa cả consent form và participation
    if (status === "DECLINED") {
      // Xóa dữ liệu liên quan
      await pool
        .request()
        .input("checkup_id", sql.Int, checkup_id)
        .query("DELETE FROM Checkup_Participation WHERE checkup_id = @checkup_id");

      await pool
        .request()
        .input("checkup_id", sql.Int, checkup_id)
        .query("DELETE FROM Checkup_Consent_Form WHERE checkup_id = @checkup_id");

      // Lấy người tạo (nurse) để gửi thông báo
      const result = await pool.request().input("checkup_id", sql.Int, checkup_id).query(`
    SELECT created_by FROM Medical_Checkup_Schedule WHERE checkup_id = @checkup_id
  `);
      const nurseId = result.recordset[0]?.created_by;
      if (nurseId) {
        await sendNotification(
          pool,
          nurseId,
          "Lịch khám bị từ chối",
          "Lịch khám sức khỏe bạn tạo đã bị từ chối bởi quản lý."
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
  const { status } = req.body;

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
      .input("parent_id", sql.Int, parent_id).query(`
        UPDATE Checkup_Consent_Form
        SET status = @status, submitted_at = GETDATE()
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
          "Một phụ huynh đã từ chối cho con em tham gia khám sức khỏe."
        );
      }
    }

    res.status(200).json({ message: "Checkup consent updated successfully." });
  } catch (error) {
    console.error("Error updating checkup consent status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { UpdateStatusCheckupByManager, UpdateStatusCheckupParent };
