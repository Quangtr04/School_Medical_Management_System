const sqlServerPool = require("../../Utils/connectMySql");
const sql = require("mssql");
const sendNotification = require("../../Utils/sendNotification");
const sendEmail = require("../../Utils/mailer");

// Tạo lịch khám sức khỏe
const createSchedule = async (req, res, next) => {
  try {
    const { title, description, scheduled_date, sponsor, className } = req.body;
    const created_by = req.user.user_id;
    const pool = await sqlServerPool;

    // Kiểm tra scheduled_date có phải Thứ 7 hoặc Chủ nhật không
    const day = new Date(scheduled_date).getDay(); // 0 = Chủ nhật, 6 = Thứ 7
    if (day === 0 || day === 6) {
      return res.status(400).json({
        status: "fail",
        message: "Ngày khám không được rơi vào Thứ 7 hoặc Chủ Nhật",
      });
    }

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
    const emailManager = await pool.request().query(`SELECT email FROM Users Where role_id = 2`);
    const managerIds = await pool.request().query(`SELECT user_id FROM Users Where role_id = 2`);

    await sendNotification(
      pool,
      managerIds.recordset[0].user_id,
      "Lịch khám sức khỏe mới",
      `Có một lịch khám sức khỏe mới cần phê duyệt: "${title}".`
    );

    await sendEmail(
      emailManager.recordset[0].email,
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
      nursesids = nurses.recordset.user_id.map((n) => n.user_id);
    }

    for (let nursesids of nurseIds) {
      const email = await pool
        .request()
        .input("user_id", sql.Int, nurseIds)
        .query("SELECT email FROmSELECT email FROM Users WHERE user_id = @user_id");
      await sendNotification(pool, nurseIds, "Lịch khám bị xóa", `Lịch khám sức khỏe (ID: ${id}) đã bị xóa.`);
      await sendEmail(email, "Lịch khám bị xóa", `Lịch khám sức khỏe (ID: ${id}) đã bị xóa.`);
    }

    // 5. Gửi thông báo đến các phụ huynh nếu đã duyệt
    if (approvalStatus === "APPROVED") {
      for (let parentId of parentIds) {
        const email = await pool
          .request()
          .input("user_id", sql.Int, parentIds)
          .query("SELECT email FROmSELECT email FROM Users WHERE user_id = @user_id");
        await sendNotification(
          pool,
          parentId,
          "Lịch khám bị hủy",
          `Lịch khám sức khỏe cho học sinh của bạn đã bị hủy.`
        );
        await sendEmail(email, "Lịch khám bị hủy", `Lịch khám sức khỏe cho học sinh của bạn đã bị hủy.`);
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
    const schedules = await pool.request()
      .query(`SELECT MS.*, U.fullname FROM Medical_Checkup_Schedule MS JOIN Users U ON MS.created_by = U.user_id 
              WHERE approval_status = 'PENDING' `);
    res.status(200).json({ data: schedules.recordset });
  } catch (err) {
    next(err);
  }
};

// Phản hồi duyệt lịch khám
const responseSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;

    const pool = await sqlServerPool;

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("status", sql.NVarChar, status)
      .input("response", sql.NVarChar, response ?? null).query(`
        UPDATE Medical_Checkup_Schedule
        SET approval_status = @status, approved_by = 'principal', response = @response
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
      const email = await pool
        .request()
        .input("user_id", sql.Int, nurseId)
        .query("SELECT email FROM Users WHERE user_id = @user_id");

      // Gửi thông báo đến nurse
      await sendNotification(
        pool,
        nurseId,
        "Lịch khám được duyệt",
        `Lịch khám sức khỏe cho lớp ${className} đã được duyệt.`
      );

      await sendEmail(
        email.recordset[0].email,
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

        const emailParent = await pool
          .request()
          .input("user_id", sql.Int, stu.parent_id)
          .query("SELECT email FROM Users WHERE user_id = @user_id");

        await sendNotification(
          pool,
          stu.parent_id,
          "Cần xác nhận lịch khám sức khỏe",
          `Vui lòng xác nhận lịch khám sức khỏe cho học sinh lớp ${className}.`
        );

        // await sendEmail(
        //   emailParent.recordset[0].email,
        //   "Cần xác nhận lịch khám sức khỏe",
        //   `Vui lòng xác nhận lịch khám sức khỏe cho học sinh lớp ${className}.`
        // );
      }
    } else if (status === "DECLINED") {
      const checkupResult = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT created_by FROM Medical_Checkup_Schedule WHERE checkup_id = @id");

      if (checkupResult.recordset.length === 0) {
        return res.status(404).json({ message: "Checkup schedule not found" });
      }

      const nurseId = checkupResult.recordset[0].created_by;
      const email = await pool
        .request()
        .input("user_id", sql.Int, nurseId)
        .query("SELECT email FROM Users WHERE user_id = @user_id");

      // Gửi thông báo cho Nurse
      await sendNotification(
        pool,
        nurseId,
        "Lịch khám bị từ chối",
        `Lịch khám sức khỏe bạn tạo đã bị từ chối bởi quản lý bởi lý do ${response}.`
      );

      await sendEmail(
        email.recordset[0].email,
        "Lịch khám bị từ chối",
        `Lịch khám sức khỏe bạn tạo đã bị từ chối bởi quản lý bởi lý do ${response}.`
      );
    }

    res.status(200).json({ message: "Schedule approval processed" });
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
