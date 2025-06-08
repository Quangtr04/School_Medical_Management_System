const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");

const forgotPasswordByEmailController = async (req, res, next) => {
  const { username } = req.body;
  const pool = await sqlServerPool;
  const result = await pool
    .request()
    .input("email", sql.NVarChar, username)
    .query("SELECT * FROM dbo.[User] WHERE email = @email");
  if (result.recordset.length > 0) {
    // User found, proceed with password reset logic
    res.status(200).json({ status: "Email found" });
  } else {
    res.status(400).json({ status: "Email not found", message: err });
  }

  res.status(400).json({ status: "fail", message: "Forgot password query failed" });
};

const forgotPasswordByPhoneController = async (req, res, next) => {
  const { username } = req.body;

  const pool = await sqlServerPool;
  const result = await pool
    .request()
    .input("phone", sql.NVarChar, username)
    .query("SELECT * FROM dbo.[User] WHERE phone = @phone");
  if (result.recordset.length > 0) {
    // User found, proceed with password reset logic
    res.status(200).json({ status: "Password reset link sent to your phone." });
  } else {
    res.status(400).json({ status: "fail", message: "Phone number not found" });
  }
};

const newPassword = async (req, res, next) => {
  const { username, newPass } = req.body;
  const pool = await sqlServerPool;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (emailRegex.test(username)) {
    const result = await pool
      .request()
      .input("email", sql.NVarChar, username)
      .input("newPassword", sql.NVarChar, newPass)
      .query("UPDATE dbo.[User] SET password = @newPassword WHERE email = @email");

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ status: "Password updated successfully" });
    } else {
      res.status(400).json({ status: "fail", message: "Failed to update password." });
    }
  } else if (!emailRegex.test(username)) {
    const result = await pool
      .request()
      .input("phone", sql.Int, username)
      .input("newPassword", sql.NVarChar, newPass)
      .query("UPDATE dbo.[User] SET password = @newPassword WHERE phone = @phone");
    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ status: "Password updated successfully" });
    } else {
      res.status(400).json({ status: "fail", message: "Failed to update password." });
    }
  }
};

module.exports = {
  forgotPasswordByEmailController,
  forgotPasswordByPhoneController,
  newPassword,
};
