const db = require("../Utils/connectMySql");

const listPendingConsent = async (req, res, next) => {
  const { user_id } = req.user;
  const forms = await db.request().input("parent_id", user_id).query(`
      SELECT * FROM Checkup_Consent_Form
      WHERE parent_id = @parent_id AND status = 'PENDING';
    `);
  res.json({ forms });
};

const respondConsent = async (req, res, next) => {
  const { form_id } = req.params;
  const { decision } = req.body; // "AGREED" or "DECLINED"

  await db.request().input("form_id", form_id).input("status", decision).query(`
      UPDATE Checkup_Consent_Form
      SET status = @status, submitted_at = GETDATE()
      WHERE form_id = @form_id;
    `);
  res.json({ message: "Consent updated" });
};

module.exports = {
  listPendingConsent,
  respondConsent,
};
