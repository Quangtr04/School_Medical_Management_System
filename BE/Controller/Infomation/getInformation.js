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
  const parentId = req.user?.user_id;
  const pool = await sqlServerPool;

  const students = await pool
    .request()
    .input("parent_id", sql.Int, parentId)
    .query(`SELECT * FROM Student_Information WHERE parent_id = @parent_id`);

  const resultList = [];

  for (let student of students.recordset) {
    const healthResult = await pool
      .request()
      .input("student_id", sql.Int, student.student_id)
      .query(`SELECT * FROM Student_Health WHERE student_id = @student_id`);

    resultList.push({
      ...student,
      health: healthResult.recordset[0] || null,
    });
  }

  res.status(200).json({
    status: "success",
    data: resultList,
  });
};

const getAllStudentInfo = async (req, res, next) => {
  const pool = await sqlServerPool;
  const result = await pool.request().query("SELECT * FROM [SWP391].[dbo].[Student_Information]");
  if (result.recordset.length > 0) {
    const resultList = [];

    for (let student of result.recordset) {
      const healthResult = await pool
        .request()
        .input("student_id", sql.Int, student.student_id)
        .query(`SELECT * FROM Student_Health WHERE student_id = @student_id`);

      resultList.push({
        ...student,
        health: healthResult.recordset[0] || null,
      });
    }
    res.status(200).json({
      status: "success",
      data: resultList,
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
    const resultList = [];
    const healthResult = await pool
      .request()
      .input("student_id", sql.Int, result.student_id)
      .query(`SELECT * FROM Student_Health WHERE student_id = @student_id`);

    resultList.push({
      ...student,
      health: healthResult.recordset[0] || null,
    });
    res.status(200).json({
      status: "success",
      data: resultList,
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
