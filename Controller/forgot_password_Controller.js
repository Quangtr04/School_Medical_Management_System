const sql = require("mssql");
const sqlServerPool = require("../Utils/connectMySql");

const forgotPasswordByEmailController = async (username) => {
  try {
    const pool = await sqlServerPool;
    const result = await pool
      .request()
      .input("email", sql.NVarChar, username)
      .query("SELECT * FROM dbo.[User] WHERE email = @email");
    if (result.recordset.length > 0) {
      // User found, proceed with password reset logic
      return "Email found.";
    } else {
      throw new Error("Email not found.");
    }
  } catch (error) {
    console.error("Forgot password query failed:", error);
    throw new Error("Forgot password failed: " + error.message);
  }
};

const forgotPasswordByPhoneController = async (username) => {
  try {
    const pool = await sqlServerPool;
    const result = await pool
      .request()
      .input("phone", sql.NVarChar, username)
      .query("SELECT * FROM dbo.[User] WHERE phone = @phone");
    if (result.recordset.length > 0) {
      // User found, proceed with password reset logic
      return "Password reset link sent to your phone.";
    } else {
      throw new Error("Phone number not found.");
    }
  } catch (error) {
    console.error("Forgot password query failed:", error);
    throw new Error("Forgot password failed: " + error.message);
  }
};

const newPassword = async (username, newPass) => {
  try {
    const pool = await sqlServerPool;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (emailRegex.test(username)) {
      const result = await pool
        .request()
        .input("email", sql.NVarChar, username)
        .input("newPassword", sql.NVarChar, newPass)
        .query("UPDATE dbo.[User] SET password = @newPassword WHERE email = @email");

      if (result.rowsAffected[0] > 0) {
        return "Password updated successfully.";
      } else {
        throw new Error("Failed to update password.");
      }
    } else if (!emailRegex.test(username)) {
      const result = await pool
        .request()
        .input("phone", sql.Int, username)
        .input("newPassword", sql.NVarChar, newPass)
        .query("UPDATE dbo.[User] SET password = @newPassword WHERE phone = @phone");
    }
  } catch (error) {
    console.error("Update password query failed:", error);
    throw new Error("Update password failed: " + error.message);
  }
};

module.exports = {
  forgotPasswordByEmailController,
  forgotPasswordByPhoneController,
  newPassword,
};
