const sql = require("mssql");

const sqlServerPool = require("../../Utils/connectMySql");
const { getRoleIdByName } = require("../../Utils/getRoleUtils");

const getUserByRole = async (req, res, next) => {
  const path = req.path.toLowerCase();
  let role_name;

  if (path.includes("parents")) {
    role_name = "Parent";
  } else if (path.includes("managers")) {
    role_name = "Manager";
  } else if (path.includes("nurses")) {
    role_name = "School_Nurse";
  } else {
    return res.status(400).json({ message: "Invalid role route" });
  }
  const pool = await sqlServerPool;
  const role_id = await getRoleIdByName(role_name);
  const result = await pool
    .request()
    .input("role_id", sql.Int, role_id)
    .query("SELECT u.*, i.fullname FROM Users u JOIN Infomation i ON u.user_id = i.user_id WHERE u.role_id = @role_id");
  if (result.recordset.length > 0) {
    res.status(200).json({
      message: "Success",
      data: result.recordset,
    });
  } else {
    res.status(400).json({
      message: "Some thing went wrong",
    });
  }
};

const getUserByUserId = async (req, res, next) => {
  const path = req.path.toLowerCase();
  const user_id = parseInt(req.params.user_id); // chuyển sang kiểu số nguyên
  let role_name;

  if (path.includes("parents")) {
    role_name = "Parent";
  } else if (path.includes("managers")) {
    role_name = "Manager";
  } else if (path.includes("nurses")) {
    role_name = "School_Nurse";
  } else {
    return res.status(400).json({ message: "Invalid role route" });
  }
  const pool = await sqlServerPool;
  const role_id = await getRoleIdByName(role_name);
  const result = await pool
    .request()
    .input("user_id", sql.Int, user_id)
    .input("role_id", sql.Int, role_id)
    .query("SELECT * FROM Users WHERE user_id = @user_id AND role_id = @role_id");
  if (result.recordset.length > 0) {
    res.status(200).json({
      message: "Success",
      data: result.recordset,
    });
  } else {
    res.status(400).json({
      message: "Some thing went wrong",
    });
  }
};

module.exports = {
  getUserByUserId,
  getUserByRole,
};
