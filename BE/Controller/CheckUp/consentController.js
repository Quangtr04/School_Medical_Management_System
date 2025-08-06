const sqlServerPool = require("../../Utils/connectMySql");
const sql = require("mssql");
const sendNotification = require("../../Utils/sendNotification");

const listPendingConsent = async (req, res, next) => {
  const user_id = req.user?.user_id;
  const pool = await sqlServerPool;
  const forms = await pool.request().input("parent_id", sql.Int, user_id).query(`
      SELECT CF.*, MC.title, MC.description, MC.scheduled_date, SI.full_name, MC.sponsor, SI.class_name FROM Checkup_Consent_Form CF 
      JOIN Medical_Checkup_Schedule MC ON CF.checkup_id = MC.checkup_id
      JOIN Student_Information SI ON CF.student_id = SI.student_id
      WHERE CF.parent_id = @parent_id AND CF.status = 'PENDING';
    `);
  res.json({ forms: forms.recordset });
};

const listAgreeConsent = async (req, res, next) => {
  const user_id = req.user?.user_id;
  const pool = await sqlServerPool;
  const forms = await pool.request().input("parent_id", sql.Int, user_id).query(`
      SELECT CF.*, MC.title, MC.description, MC.scheduled_date, SI.full_name, MC.sponsor, SI.class_name FROM Checkup_Consent_Form CF 
      JOIN Medical_Checkup_Schedule MC ON CF.checkup_id = MC.checkup_id
      JOIN Student_Information SI ON CF.student_id = SI.student_id
      WHERE CF.parent_id = @parent_id AND CF.status = 'AGREED';
    `);
  res.json({ forms: forms.recordset });
};

const listDeclineConsent = async (req, res, next) => {
  const user_id = req.user?.user_id;
  const pool = await sqlServerPool;
  const forms = await pool.request().input("parent_id", sql.Int, user_id).query(`
      SELECT CF.*, MC.title, MC.description, MC.scheduled_date, SI.full_name, MC.sponsor, SI.class_name FROM Checkup_Consent_Form CF 
      JOIN Medical_Checkup_Schedule MC ON CF.checkup_id = MC.checkup_id
      JOIN Student_Information SI ON CF.student_id = SI.student_id
      WHERE CF.parent_id = @parent_id AND CF.status = 'DECLINED';
    `);
  res.json({ forms: forms.recordset });
};

const respondConsent = async (req, res, next) => {
  const { form_id } = req.params;
  const { status, note } = req.body;
  const user_id = req.user?.user_id;

  if (!["AGREED", "DECLINED"].includes(status)) {
    return res.status(400).json({ message: "Invalid decision value. Must be 'AGREED' or 'DECLINED'." });
  }

  try {
    const pool = await sqlServerPool;

    const formResult = await pool.request().input("form_id", sql.Int, form_id).input("parent_id", sql.Int, user_id)
      .query(`
        SELECT checkup_id, student_id FROM Checkup_Consent_Form
        WHERE form_id = @form_id AND parent_id = @parent_id
      `);

    if (formResult.recordset.length === 0) {
      return res.status(404).json({ message: "Consent form not found or access denied." });
    }

    const { checkup_id, student_id } = formResult.recordset[0];

    await pool
      .request()
      .input("status", sql.NVarChar, status)
      .input("form_id", sql.Int, form_id)
      .input("note", sql.NVarChar, note).query(`
        UPDATE Checkup_Consent_Form
        SET status = @status, submitted_at = GETDATE(), note = @note
        WHERE form_id = @form_id
      `);

    if (status === "AGREED") {
      // Thêm vào danh sách tham gia nếu đồng ý
      await pool
        .request()
        .input("checkup_id", sql.Int, checkup_id)
        .input("student_id", sql.Int, student_id)
        .input("consent_form_id", sql.Int, form_id).query(`
          IF NOT EXISTS (
            SELECT 1 FROM Checkup_Participation
            WHERE checkup_id = @checkup_id AND student_id = @student_id
          )
          BEGIN
            INSERT INTO Checkup_Participation (checkup_id, student_id, consent_form_id)
            VALUES (@checkup_id, @student_id, @consent_form_id)
          END
        `);

      // 🔔 Gửi thông báo cho Nurse
      const nurseInfo = await pool.request().input("checkup_id", sql.Int, checkup_id).query(`
          SELECT created_by FROM Medical_Checkup_Schedule
          WHERE checkup_id = @checkup_id
        `);

      if (nurseInfo.recordset.length > 0) {
        const nurseId = nurseInfo.recordset[0].created_by;

        await sendNotification(
          pool,
          nurseId,
          "Phụ huynh đã đồng ý khám sức khỏe",
          "Một phụ huynh đã đồng ý cho con em tham gia khám sức khỏe."
        );
      }
    } else if (status === "DECLINED") {
      // 🔔 Gửi thông báo cho Nurse nếu từ chối
      const nurseInfo = await pool.request().input("checkup_id", sql.Int, checkup_id).query(`
          SELECT created_by FROM Medical_Checkup_Schedule
          WHERE checkup_id = @checkup_id
        `);

      if (nurseInfo.recordset.length > 0) {
        const nurseId = nurseInfo.recordset[0].created_by;

        await sendNotification(
          pool,
          nurseId,
          "Phụ huynh đã từ chối khám sức khỏe",
          `Một phụ huynh đã từ chối cho con em tham gia khám sức khỏe vì lý do: ${note}.`
        );
      }
    }

    res.json({ message: "Consent updated successfully" });
  } catch (error) {
    console.error("respondConsent error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  listPendingConsent,
  respondConsent,
  listAgreeConsent,
  listDeclineConsent,
};
