const sqlServerPool = require("../../Utils/connectMySql");

const getAttendanceList = async (req, res, next) => {
  const { schedule_id } = req.params;
  const pool = await sqlServerPool;
  const list = await pool.request().input("checkup_id", schedule_id).query(`SELECT * FROM Checkup_Participation `);
  res.json({ list: list.recordset });
};

const markAttendance = async (req, res, next) => {
  const { schedule_id, student_id } = req.params;
  const { present } = req.body;

  await pool
    .request()
    .input("checkup_id", schedule_id)
    .input("student_id", student_id)
    .input("present", present ? 1 : 0)
    .query(
      `UPDATE Checkup_Participation SET is_present = @present WHERE checkup_id = @checkup_id AND student_id = @student_id`
    );

  res.json({ message: "Attendance marked" });
};

module.exports = { getAttendanceList, markAttendance };
