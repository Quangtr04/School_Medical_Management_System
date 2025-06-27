const sql = require("mssql");
const sqlServerPool = require("./connectMySql");

async function getStudentIdByName(student_name) {
  const pool = await sqlServerPool;
  const result = await pool
    .request()
    .input("student_name", sql.NVarChar, student_name)
    .query("SELECT student_id FROM Student_Information WHERE UPPER(full_name) = UPPER(@student_name)");
  if (result.recordset.length > 0) {
    return result.recordset[0].student_id;
  } else {
    return null; // hoặc throw new Error("Student not found");
  }
}

module.exports = {
  getStudentIdByName,
};
