const sql = require("mssql");

const sqlServerPool = require("../../Utils/connectMySql");

const getAllUser = async (req, res, next) => {
  const pool = await sqlServerPool;
  const result = await pool.request().query("SELECT * FROM Users");
  if (result.recordset.length > 0) {
    res.status(200).json({
      message: "Success",
      data: result,
    });
  } else {
    res.status(400).json({
      message: "Some thing went wrong",
    });
  }
};

const getUserByUserId = async (req, res, next) => {
  const pool = await sqlServerPool;
  const user_id = req.params.id;
  const result = await pool
    .request()
    .input("user_id", sql.Int, user_id)
    .query(`SELECT * FROM Users WHERE user_id = @user_id`);
  if (result.recordset.length > 0) {
    res.status(200).json({
      message: "Success",
      data: result,
    });
  } else {
    res.status(400).json({
      message: "Some thing went wrong",
    });
  }
};

const getUserByRole = async (req, res, next) => {
  const pool = await sqlServerPool;
  const role = req.param.role;
  const result = await getRole();
};

module.exports = {
  getAllUser,
  getUserByUserId,
};
