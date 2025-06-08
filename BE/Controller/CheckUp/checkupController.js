const db = require("../../Utils/connectMySql"); // cấu hình pool sql
const sql = require("mssql");

const createSchedule = async (req, res, next) => {
  const { title, description, scheduled_date, fee } = req.body;
  const created_by = req.user.user_id;

  const result = await db
    .request()
    .input("title", title)
    .input("description", description)
    .input("scheduled_date", scheduled_date)
    .input("fee", fee)
    .input("created_by", created_by).query(`
      INSERT INTO MedicalCheckup_Schedule
        (title, description, scheduled_date, fee, created_by, approval_status)
        OUTPUT inserted.checkup_id
      VALUES
        (@title, @description, @scheduled_date, @fee, @created_by, 'PENDING');
    `);

  res.status(201).json({ message: "Schedule created", id: result.recordset.checkup_id });
};

const getPending = async (req, res, next) => {
  const schedules = await db.request().query("SELECT * FROM MedicalCheckup_Schedule WHERE approval_status = 'PENDING'");
  res.status(201).json({ data: schedules.recordset });
};

const responseSchedule = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const update = await db.request().input("id", sql.Int, id).input("status", sql.NVarChar, status).query(`
      UPDATE MedicalCheckup_Schedule
      SET approval_status = @status
      WHERE checkup_id = @id;
    `);
  if (status === "APPROVED") {
    const students = await db.query(`
    SELECT student_info_id, parent_id FROM Student_Information
  `);
    const checkup = await db
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM MedicalCheckup_Schedule WHERE checkup_id = @id");
    const request = db.request();
    for (let stu of students.recordset) {
      request
        .input("student_id", sql.Int, stu.student_info_id)
        .input("parent_id", sql.Int, stu.parent_id)
        .input("checkup_id", sql.Int, checkup.checkup_id)
        .input("fee", sql.Int, checkup.fee).query(`
        INSERT INTO Checkup_Consent_Form (student_id, parent_id, checkup_id, status, fee)
        VALUES (@student_id, @parent_id, @checkup_id, 'PENDING', @fee)
      `);
    }
  }
  // TODO: send notifications to parents
  res.json({ message: "Schedule approved" });
};

module.exports = {
  createSchedule,
  getPending,
  responseSchedule,
};
