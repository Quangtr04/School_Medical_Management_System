const sqlServerPool = require("../../Utils/connectMySql"); // cấu hình pool sql
const sql = require("mssql");

const createSchedule = async (req, res, next) => {
  const { title, description, scheduled_date, sponsor, className } = req.body;
  const created_by = req.user.user_id;
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("title", title)
    .input("description", description)
    .input("scheduled_date", scheduled_date)
    .input("created_by", created_by)
    .input("sponsor", sponsor)
    .input("className", className).query(`
      INSERT INTO Medical_Checkup_Schedule
        (title, description, scheduled_date, created_by, approval_status, sponsor, class, approved_by)
        OUTPUT inserted.checkup_id
      VALUES
        (@title, @description, @scheduled_date, @fee, @created_by, 'PENDING', @sponsor, @className, null);
    `);

  res.status(201).json({ message: "Schedule created", id: result.recordset.checkup_id });
};

const getPending = async (req, res, next) => {
  const pool = await sqlServerPool;
  const schedules = await pool
    .request()
    .query("SELECT * FROM Medical_Checkup_Schedule WHERE approval_status = 'PENDING'");
  res.status(201).json({ data: schedules.recordset });
};

const responseSchedule = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const pool = await sqlServerPool;
  const update = await pool.request().input("id", sql.Int, id).input("status", sql.NVarChar, status).query(`
      UPDATE Medical_Checkup_Schedule
      SET approval_status = @status AND approved_by = 'principal'
      WHERE checkup_id = @id;
    `);
  if (status === "APPROVED") {
    const students = await pool.query(`
    SELECT student_info_id, parent_id FROM Student_Information
  `);
    const checkup = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Medical_Checkup_Schedule WHERE checkup_id = @id");
    const request = pool.request();
    for (let stu of students.recordset) {
      request
        .input("student_id", sql.Int, stu.student_info_id)
        .input("parent_id", sql.Int, stu.parent_id)
        .input("checkup_id", sql.Int, checkup.checkup_id)
        .input("fee", sql.Int, checkup.fee).query(`
        INSERT INTO Checkup_Consent_Form (student_id, parent_id, checkup_id, status)
        VALUES (@student_id, @parent_id, @checkup_id, 'PENDING')
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
