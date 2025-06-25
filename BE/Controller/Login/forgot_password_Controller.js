const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");

const forgotPasswordController = async (req, res, next) => {
  const { username } = req.body;
  const pool = await sqlServerPool;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Regex cho số điện thoại Việt Nam (ví dụ: bắt đầu bằng 0, dài 10 hoặc 11 số)
  const phoneRegex = /^0(3|5|7|8|9)\d{8}$/; // Thêm regex phù hợp với định dạng số điện thoại mong muốn
  if (emailRegex.test(username)) {
    const result = await pool
      .request()
      .input("email", sql.NVarChar, username)
      .query("SELECT user_id FROM dbo.[Users] WHERE email = @email");
    if (result.recordset.length > 0) {
      // User found, proceed with password reset logic
      res.status(200).json({ status: "Email found", userId: result.recordset[0].user_id });
    } else {
      res.status(400).json({ status: "Email not found", message: err });
    }
  } else if (phoneRegex.test(username)) {
    const result = await pool
      .request()
      .input("phone", sql.NVarChar, username)
      .query("SELECT user_id FROM dbo.[Users] WHERE phone = @phone");
    if (result.recordset.length > 0) {
      // User found, proceed with password reset logic
      res.status(200).json({ status: "Phone number found", userId: result.recordset[0].user_id });
    } else {
      res.status(400).json({ status: "Email not found", message: "No user with this email." });
    }
  } else {
    res.status(400).json({ status: "fail", message: "Invalid email or phone number format" });
  }
};

const newPassword = async (req, res, next) => {
  const { user_id, newPass, confirmPass } = req.body;

  if (!user_id || !newPass || !confirmPass) {
    return res.status(400).json({
      status: "fail",
      message: "Missing required fields: user_id, newPass, confirmPass",
    });
  }

  if (newPass !== confirmPass) {
    return res.status(400).json({
      status: "fail",
      message: "Password confirmation does not match",
    });
  }

  try {
    const pool = await sqlServerPool;

    const result = await pool.request().input("user_id", sql.Int, user_id).input("newPassword", sql.NVarChar, newPass)
      .query(`
        UPDATE dbo.[Users] 
        SET password = @newPassword 
        WHERE user_id = @user_id
      `);

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({
        status: "success",
        message: "Password updated successfully",
      });
    } else {
      res.status(404).json({
        status: "fail",
        message: "User not found or password update failed",
      });
    }
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = {
  forgotPasswordController,
  newPassword,
};
