const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");

const getParentInfo = async (req, res, next) => {
  const pool = await sqlServerPool;
  const result = await pool.request().query("SELECT * FROM [Users] WHERE role_id = 4");
  if (result.recordset.length > 0) {
    res.status(200).json({
      status: "success",
      data: result.recordset[0],
    });
  } else {
    res.status(404).json({
      status: "fail",
      message: "Parent information not found",
    });
  }
};

const getAllStudentByParentId = async (req, res, next) => {
  const { user_id } = req.params;
  const pool = await sqlServerPool;
  const result = await pool
    .request()
    .input("user_id", sql.Int, user_id)
    .query("SELECT s.* FROM Student_Information s JOIN Users u ON s.parent_id = u.user_id WHERE u.user_id = @user_id");
  if (result.recordset.length > 0) {
    res.status(200).json({
      status: "success",
      data: result.recordset,
    });
  } else {
    res.status(404).json({
      status: "fail",
      message: "No students found for this parent",
    });
  }
};

const getAllStudentInfo = async (req, res, next) => {
  const pool = await sqlServerPool;
  const result = await pool.request().query("SELECT * FROM [SWP391].[dbo].[Student_Information]");
  if (result.recordset.length > 0) {
    res.status(200).json({
      status: "success",
      data: result.recordset,
    });
  } else {
    res.status(404).json({
      status: "fail",
      message: "Failed to get all student info",
    });
  }
};

const getStudentInfoById = async (req, res, next) => {
  const { student_id } = req.params;

  const pool = await sqlServerPool;
  const result = await pool.request().input("student_id", sql.Int, student_id).query(`
        SELECT * FROM [SWP391].[dbo].[Student_Information] WHERE student_id = @student_id`);
  if (result.recordset.length > 0) {
    res.status(200).json({
      status: "success",
      data: result.recordset[0],
    });
  } else {
    res.status(404).json({
      status: "fail",
      message: "Student information not found",
    });
  }
};

module.exports = {
  getParentInfo,
  getAllStudentInfo,
  getStudentInfoById,
  getAllStudentByParentId,
};
