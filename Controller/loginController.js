// controllers/loginController.js
const sql = require("mssql");
const sqlServerPool = require("../Utils/connectMySql"); // đúng đường dẫn tới pool

const loginController = async (username, password) => {
  try {
    const pool = await sqlServerPool; // chờ kết nối
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (emailRegex.test(username)) {
      const result = await pool
        .request()
        .input("username", sql.NVarChar, username)
        .input("password", sql.NVarChar, password)
        .query("SELECT * FROM [User] WHERE email = @username AND password = @password");
      if (result.recordset.length > 0) {
        const { role_id, user_id } = result.recordset[0];
        const user = await pool
          .request()
          .input("user_id", sql.Int, user_id)
          .query("SELECT * FROM [Infomation] WHERE user_id = @user_id");
        return Object.assign(user.recordset[0]);
      } else {
        throw new Error("Invalid username or password");
      }
    } else if (!emailRegex.test(username)) {
      const result = await pool
        .request()
        .input("username", sql.Int, username)
        .input("password", sql.NVarChar, password)
        .query("SELECT * FROM [User] WHERE phone = @username AND password = @password");
      if (result.recordset.length > 0) {
        const { role_id, user_id } = result.recordset[0];
        const user = await pool
          .request()
          .input("user_id", sql.Int, user_id)
          .query("SELECT * FROM [Infomation] WHERE user_id = @user_id");
        return Object.assign(user.recordset[0]);
      } else {
        throw new Error("Invalid username or password");
      }
    } else {
      throw new Error("Invalid username or password");
    }
  } catch (error) {
    console.error("Login query failed:", error);
    throw new Error("Login failed");
  }
};

module.exports = loginController;
