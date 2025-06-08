const { resolve } = require("path");
const db = require("../../Utils/connectMySql");
const sql = require("mssql");

const listPendingConsent = async (req, res, next) => {
  const { user_id } = req.user;
  const forms = await db.request().input("parent_id", sql.Int, user_id).query(`
      SELECT * FROM Checkup_Consent_Form
      WHERE parent_id = @parent_id AND status = 'PENDING';
    `);
  res.json({ forms });
};

const respondConsent = async (req, res, next) => {
  const { checkup_id } = req.params;
  const { decision } = req.body; // "AGREED" or "DECLINED"

  await db.request().input("checkup_id", sql.Int, checkup_id).input("status", sql.NVarChar, decision).query(`
      UPDATE Checkup_Consent_Form
      SET status = @status, submitted_at = GETDATE()
      WHERE checkup_id = @checkup_id;
    `);
  if (decision === "AGREED") {
    const listStudent = await db
      .request()
      .input("checkup_id", sql.Int, checkup_id)
      .query(`SELECT * FROM Checkup_Consent_Form WHERE status = 'AGREED' AND checkup_id = @checkup_id`);
    for (let student of listStudent.recordset) {
      await db
        .request()
        .input("checkup_id", sql.Int, checkup_id)
        .input("student_id", sql.Int, student.student_id)
        .input("consent_form_id", sql.Int, student.form_id)
        .query(
          `IF NOT EXISTS (
            SELECT 1 FROM Checkup_Participation
            WHERE checkup_id = @checkup_id AND student_id = @student_id
          )
          BEGIN
            INSERT INTO Checkup_Participation (checkup_id, student_id, consent_form_id, is_present)
            VALUES (@checkup_id, @student_id, @consent_form_id, NULL)
          END`
        );
    }
  }
  res.json({ message: "Consent updated" });
};

module.exports = {
  listPendingConsent,
  respondConsent,
};
