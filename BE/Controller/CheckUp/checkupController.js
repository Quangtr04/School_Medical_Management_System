const sqlServerPool = require("../../Utils/connectMySql");
const sql = require("mssql");
const sendNotification = require("../../Utils/sendNotification");

// Tạo lịch khám sức khỏe
const createSchedule = async (req, res, next) => {
  try {
    const { title, description, scheduled_date, sponsor, className } = req.body;
    const created_by = req.user.user_id;
    const pool = await sqlServerPool;

    const result = await pool
      .request()
      .input("title", sql.NVarChar, title)
      .input("description", sql.NVarChar, description)
      .input("scheduled_date", sql.Date, scheduled_date)
      .input("created_by", sql.Int, created_by)
      .input("sponsor", sql.NVarChar, sponsor)
      .input("class", sql.Int, className).query(`
        INSERT INTO Medical_Checkup_Schedule
          (title, description, scheduled_date, created_by, approval_status, sponsor, class, approved_by)
        OUTPUT inserted.checkup_id
        VALUES
          (@title, @description, @scheduled_date, @created_by, 'PENDING', @sponsor, @class, NULL);
      `);

    const checkupId = result.recordset[0].checkup_id;

    // ✅ Gửi thông báo cho tất cả Manager
    const managers = await pool.request().query(`SELECT user_id FROM Users WHERE role_id = 2`);
    const managerIds = managers.recordset.map((m) => m.user_id);

    await sendNotification(
      pool,
      managerIds,
      "Lịch khám sức khỏe mới",
      `Có một lịch khám sức khỏe mới cần phê duyệt: "${title}".`
    );

    res.status(201).json({ message: "Schedule created", id: checkupId });
  } catch (err) {
    console.error("Create schedule error:", err);
    next(err);
  }
};

const deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await sqlServerPool;

    // 1. Kiểm tra lịch khám có tồn tại và lấy trạng thái
    const check = await pool.request().input("id", sql.Int, id).query(`
        SELECT checkup_id, approval_status 
        FROM Medical_Checkup_Schedule 
        WHERE checkup_id = @id
      `);

    if (check.recordset.length === 0) {
      return res.status(404).json({ message: "Checkup schedule not found." });
    }

    const approvalStatus = check.recordset[0].approval_status;

    // 2. Lấy danh sách parent trước khi xóa (nếu đã duyệt)
    let parentIds = [];
    if (approvalStatus === "APPROVED") {
      const parentResult = await pool.request().input("checkup_id", sql.Int, id).query(`
          SELECT DISTINCT parent_id 
          FROM Checkup_Consent_Form 
          WHERE checkup_id = @checkup_id
        `);
      parentIds = parentResult.recordset.map((row) => row.parent_id);
    }

    // 3. Xóa dữ liệu liên quan theo thứ tự
    await pool.request().input("id", sql.Int, id).query(`
      DELETE FROM Checkup_Participation WHERE checkup_id = @id;
      DELETE FROM Checkup_Consent_Form WHERE checkup_id = @id;
      DELETE FROM Medical_Checkup_Schedule WHERE checkup_id = @id;
    `);

    // 4. Gửi thông báo đến các Nurse
    let nursesids = [];
    for (let nurse of nurses.recordset) {
      const nurses = await pool.request().query(`
      SELECT user_id FROM Users WHERE role_id = 3
    `);
      nursesids = nurses.recordset.map((n) => n.user_id);
    }

    for (let nursesids of nurseIds) {
      await sendNotification(pool, nurseIds, "Lịch khám bị xóa", `Lịch khám sức khỏe (ID: ${id}) đã bị xóa.`);
    }

    // 5. Gửi thông báo đến các phụ huynh nếu đã duyệt
    if (approvalStatus === "APPROVED") {
      for (let parentId of parentIds) {
        await sendNotification(
          pool,
          parentId,
          "Lịch khám bị hủy",
          `Lịch khám sức khỏe cho học sinh của bạn đã bị hủy.`
        );
      }
    }

    // 6. Phản hồi thành công
    return res.status(200).json({
      message: "Checkup schedule and related data deleted successfully.",
    });
  } catch (error) {
    console.error("Delete schedule error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Lấy danh sách lịch khám đang chờ duyệt
const getPending = async (req, res, next) => {
  try {
    const pool = await sqlServerPool;
    const schedules = await pool
      .request()
      .query("SELECT * FROM Medical_Checkup_Schedule WHERE approval_status = 'PENDING'");
    res.status(200).json({ data: schedules.recordset });
  } catch (err) {
    next(err);
  }
};

// Phản hồi duyệt lịch khám
const responseSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const pool = await sqlServerPool;

    await pool.request().input("id", sql.Int, id).input("status", sql.NVarChar, status).query(`
        UPDATE Medical_Checkup_Schedule
        SET approval_status = @status, approved_by = 'principal'
        WHERE checkup_id = @id;
      `);

    if (status === "APPROVED") {
      const checkupResult = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT class AS class_name, created_by FROM Medical_Checkup_Schedule WHERE checkup_id = @id");

      if (checkupResult.recordset.length === 0) {
        return res.status(404).json({ message: "Checkup schedule not found" });
      }

      const className = checkupResult.recordset[0].class_name;
      const nurseId = checkupResult.recordset[0].created_by;

      // Gửi thông báo đến nurse
      await sendNotification(
        pool,
        nurseId,
        "Lịch khám được duyệt",
        `Lịch khám sức khỏe cho lớp ${className} đã được duyệt.`
      );

      const students = await pool.request().input("class", sql.Int, className).query(`
        SELECT student_id, parent_id FROM Student_Information
        WHERE class_name LIKE CAST(@class AS NVARCHAR) + '%'
      `);

      for (let stu of students.recordset) {
        await pool
          .request()
          .input("student_id", sql.Int, stu.student_id)
          .input("parent_id", sql.Int, stu.parent_id)
          .input("checkup_id", sql.Int, id).query(`
            INSERT INTO Checkup_Consent_Form (student_id, parent_id, checkup_id, status, submitted_at)
            VALUES (@student_id, @parent_id, @checkup_id, 'PENDING', NULL)
          `);

        await sendNotification(
          pool,
          stu.parent_id,
          "Cần xác nhận lịch khám sức khỏe",
          `Vui lòng xác nhận lịch khám sức khỏe cho học sinh lớp ${className}.`
        );
      }
    }

    res.json({ message: "Schedule approval processed" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createSchedule,
  getPending,
  responseSchedule,
  deleteSchedule,
};
