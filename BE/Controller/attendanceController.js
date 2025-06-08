const db = require("../Utils/connectMySql");

const getAttendanceList = async (req, res, next) => {
  const { schedule_id } = req.params;
  const list = await db.request().input("checkup_id", schedule_id).query(`
      SELECT c.form_id, c.student_id, s.full_name, c.status
      FROM Checkup_Consent_Form c
      JOIN Student_Information s ON c.student_id = s.student_info_id
      WHERE c.checkup_id = @checkup_id AND c.status = 'AGREED';
    `);
  res.json({ list: list.recordset });
};

const markAttendance = async (req, res, next) => {
  const { schedule_id } = req.params;
  const { student_id, present } = req.body;

  await db
    .request()
    .input("checkup_id", schedule_id)
    .input("student_id", student_id)
    .input("present", present ? 1 : 0).query(`
      INSERT INTO Checkup_Participation
        (checkup_id, student_id, consent_form_id, is_present)
      VALUES
        (@checkup_id, @student_id,
         (SELECT form_id FROM Checkup_Consent_Form 
          WHERE checkup_id = @checkup_id AND student_id = @student_id),
         @present);
    `);

  res.json({ message: "Attendance marked" });
};

module.exports = { getAttendanceList, markAttendance };
