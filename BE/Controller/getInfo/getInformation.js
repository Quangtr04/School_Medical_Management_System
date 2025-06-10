const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const getRole = require("../../Utils/getRole");

const getParentInfo = async (req, res, next) => {
  const pool = await sqlServerPool;
  const result = await pool
    .request()
    .query("SELECT * FROM [Infomation] WHERE user_id = @user_id");
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
    .query(
      "SELECT s.student_info_id, s.full_name FROM [SWP391].[dbo].[Student_Information] s JOIN [SWP391].[dbo].[Infomation] i ON s.parent_id = i.user_id WHERE i.user_id = @user_id"
    );
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
  const result = await pool
    .request()
    .query("SELECT * FROM [SWP391].[dbo].[Student_Information]");
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
  const result = await pool.request().input("student_id", sql.Int, student_id)
    .query(`
        SELECT [student_info_id],
               [student_code],
               [full_name],
               [gender],
               [date_of_birth],
               [class_name],
               [parent_id],
               [address] FROM [SWP391].[dbo].[Student_Information] WHERE student_info_id = @student_id`);
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

const getStudentHealthById = async (req, res, next) => {
  const { student_id } = req.params;

  const pool = await sqlServerPool;
  const result = await pool.request().input("student_id", sql.Int, student_id)
    .query(`
        SELECT [height_cm],
               [weight_kg],
               [blood_type],
               [allergy],
               [chronic_diseases],
               [vision_left],
               [vision_right],
               [hearing_left],
               [hearing_right],
               [health_status] FROM [SWP391].[dbo].[Student_Health] WHERE student_id = @student_id`);
  if (result.recordset.length > 0) {
    res.status(200).json({
      status: "success",
      data: result.recordset[0],
    });
  } else {
    res.status(404).json({
      status: "fail",
      message: "Student health information not found",
    });
  }
};

module.exports = {
  getParentInfo,
  getAllStudentInfo,
  getStudentInfoById,
  getAllStudentByParentId,
};
