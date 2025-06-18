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
      .query("SELECT * FROM dbo.[Users] WHERE email = @email");
    if (result.recordset.length > 0) {
      // User found, proceed with password reset logic
      res.status(200).json({ status: "Email found" });
    } else {
      res.status(400).json({ status: "Email not found", message: err });
    }
  } else if (phoneRegex.test(username)) {
    const result = await pool
      .request()
      .input("phone", sql.NVarChar, username)
      .query("SELECT * FROM dbo.[Users] WHERE phone = @phone");
    if (result.recordset.length > 0) {
      // User found, proceed with password reset logic
      res.status(200).json({ status: "Phone number found" });
    } else {
      res.status(400).json({ status: "Phone number not found", message: err });
    }
  } else {
    res.status(400).json({ status: "fail", message: "Invalid email or phone number format" });
  }
};

const newPassword = async (req, res, next) => {
  const { username, newPass } = req.body;
  const pool = await sqlServerPool;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Regex cho số điện thoại Việt Nam (ví dụ: bắt đầu bằng 0, dài 10 hoặc 11 số)
  const phoneRegex = /^0(3|5|7|8|9)\d{8}$/; // Thêm regex phù hợp với định dạng số điện thoại mong muốn
  if (emailRegex.test(username)) {
    const result = await pool
      .request()
      .input("email", sql.NVarChar, username)
      .input("newPassword", sql.NVarChar, newPass)
      .query("UPDATE dbo.[Users] SET password = @newPassword WHERE email = @email");

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ status: "Password updated successfully" });
    } else {
      res.status(400).json({ status: "fail", message: "Failed to update password." });
    }
  } else if (!emailRegex.test(username)) {
    if (phoneRegex.test(username)) {
      const result = await pool
        .request()
        .input("phone", sql.Int, username)
        .input("newPassword", sql.NVarChar, newPass)
        .query("UPDATE dbo.[Users] SET password = @newPassword WHERE phone = @phone");
      if (result.rowsAffected[0] > 0) {
        res.status(200).json({ status: "Password updated successfully" });
      } else {
        res.status(400).json({ status: "fail", message: "Failed to update password." });
      }
    }
  } else {
    res.status(400).json({ status: "fail", message: "Invalid email or phone number format" });
  }
};

module.exports = {
  forgotPasswordController,
  newPassword,
};
