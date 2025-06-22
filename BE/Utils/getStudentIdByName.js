const sql = require("mssql");
const sqlServerPool = require("./connectMySql");

async function getStudentIdByName(student_name) {
  const pool = await sqlServerPool;
  const result = await pool
    .request()
    .input("student_name", sql.NVarChar, student_name)
    .query("SELECT student_id FROM Student_Info WHERE UPPER(full_name) = UPPER(@student_name)");
  return result.recordset[0].student_id;
}

module.exports = {
  getStudentIdByName,
};
