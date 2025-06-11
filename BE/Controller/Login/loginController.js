const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql"); // đúng đường dẫn tới pool
const generateToken = require("../../Utils/jwt");

const loginController = async (req, res, next) => {
  const { username, password } = req.body;
  const pool = await sqlServerPool; // chờ kết nối
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Regex cho số điện thoại Việt Nam (ví dụ: bắt đầu bằng 0, dài 10 hoặc 11 số)
  const phoneRegex = /^0(3|5|7|8|9)\d{8}$/; // Thêm regex phù hợp với định dạng số điện thoại mong muốn
  if (emailRegex.test(username)) {
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, password)
      .query("SELECT * FROM [Users] WHERE email = @username AND password = @password");
    if (result.recordset.length > 0) {
      const { role_id, user_id } = result.recordset[0];
      const user = await pool
        .request()
        .input("user_id", sql.Int, user_id)
        .query("SELECT * FROM [Infomation] WHERE user_id = @user_id");
      const token = generateToken({ user_id, role: role_id });
      res.status(200).json({ status: "success", token, user: user.recordset[0] });
    } else {
      res.status(401).json({ status: "fail", message: "Invalid email or password" });
    }
  } else if (!emailRegex.test(username)) {
    if (phoneRegex.test(username)) {
      const result = await pool
        .request()
        .input("username", sql.VarChar, username)
        .input("password", sql.NVarChar, password)
        .query("SELECT * FROM [Users] WHERE phone = @username AND password = @password");
      if (result.recordset.length > 0) {
        const { role_id, user_id } = result.recordset[0];
        const user = await pool
          .request()
          .input("user_id", sql.Int, user_id)
          .query("SELECT * FROM [Infomation] WHERE user_id = @user_id");
        const token = generateToken({ user_id, role: role_id });
        res.status(200).json({ status: "success", token, user: user.recordset[0] });
      } else {
        res.status(401).json({ status: "fail", message: "Invalid phone number or password" });
      }
    } else {
      res.status(401).json({ status: "fail", message: "Invalid username or password" });
    }
  } else {
    res.status(401).json({ status: "fail", message: "Wrong username format" });
  }
};

module.exports = loginController;
