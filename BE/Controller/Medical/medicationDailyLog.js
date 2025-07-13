// Import các thư viện và module cần thiết
const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const sendEmail = require("../../Utils/mailer");
const sendNotification = require("../../Utils/sendNotification");

// Hàm cập nhật trạng thái nhật ký uống thuốc
const updateStatusMedicationDailyLog = async (req, res, next) => {
  const nurse_id = req.user?.user_id;
  const ReqId = req.params.ReqId; // ID của yêu cầu uống thuốc
  const { status } = req.body;

  // 1. Kiểm tra nếu không có status được gửi lên
  if (!status) {
    return res.status(400).json({
      status: "fail",
      message: "Missing required field: status",
    });
  }

  try {
    const pool = await sqlServerPool;
    if (!["GIVEN", "NOT GIVEN"].includes(status)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid status value. Must be 'GIVEN' or 'NOT GIVEN'.",
      });
    }

    // 2. Kiểm tra xem nhật ký có tồn tại với id_req không
    const checkLog = await pool
      .request()
      .input("id_req", sql.Int, ReqId)
      .input("nurse_id", sql.Int, nurse_id)
      .query("SELECT id_req FROM Medication_Daily_Log WHERE id_req = @id_req AND nurse_id = @nurse_id");

    if (checkLog.recordset.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: `No Medication Daily Log found with id_req = ${ReqId}`,
      });
    }

    // 3. Cập nhật trạng thái và thời gian cập nhật
    await pool
      .request()
      .input("id_req", sql.Int, ReqId)
      .input("status", sql.NVarChar, status)
      .input("updated_at", sql.DateTime, new Date()).query(` 
        UPDATE Medication_Daily_Log 
        SET status = @status, 
            updated_at = @updated_at 
        WHERE id_req = @id_req
      `);

    const parentId = await pool
      .request()
      .input("id_req", sql.Int, ReqId)
      .query(`SELECT parent_id FROM Medication_Submisstion_Request WHERE id_req = @id_req`);

    if (status === "GIVEN") {
      sendNotification(
        pool,
        parentId.recordset[0].parent_id,
        "Cập nhật trạng thái uống thuốc",
        "Y tá đã cập nhật trạng thái uống thuốc cho học sinh"
      );
    } else if (status === "NOT GIVEN") {
      sendNotification(
        pool,
        parentId.recordset[0].parent_id,
        "Cập nhật trạng thái uống thuốc",
        "Y tá đã cập nhật trạng thái chưa cho học sinh uống thuốc"
      );
    }

    // 4. Trả về phản hồi thành công
    res.status(200).json({
      status: "success",
      message: "Medication Daily Log status updated successfully",
    });
  } catch (error) {
    console.error("Error updating Medication Daily Log status:", error);
    res.status(500).json({
      status: "error",
      message: "Server error while updating Medication Daily Log status",
    });
  }
};

// Hàm kiểm tra và gửi email nếu chưa cập nhật uống thuốc
const checkUnupdatedMedicationLogs = async () => {
  try {
    const pool = await sqlServerPool;

    // Truy vấn lấy tất cả nhật ký hôm nay có status là 'PENDING' và chưa có ảnh, sau 18:00
    const result = await pool.request().query(`
      SELECT 
          log.log_id,
          log.date,
          log.status,
          log.image_url,
          req.parent_id,
          u.full_name AS parent_name,
          u.email AS parent_email
      FROM Medication_Daily_Log log
      JOIN Medication_Submisstion_Request req ON log.id_req = req.id_req
      JOIN Users u ON req.parent_id = u.user_id
      WHERE 
          log.date = CAST(GETDATE() AS DATE) -- chỉ lấy bản ghi hôm nay
          AND log.status = 'PENDING'         -- y tá chưa cập nhật trạng thái
          AND log.image_url IS NULL          -- chưa có ảnh xác nhận
          AND CAST(GETDATE() AS TIME) > '18:00:00' -- chỉ gửi sau 6 giờ tối
    `);

    const logs = result.recordset; // Danh sách kết quả truy vấn

    // Lặp qua từng bản ghi để gửi email
    for (const log of logs) {
      const subject = "🔔 Cảnh báo: Chưa cập nhật nhật ký uống thuốc";

      const message =
        `Kính gửi phụ huynh ${log.parent_name},\n\n` +
        `Y tá hiện chưa cập nhật trạng thái và ảnh xác nhận cho học sinh vào ngày ${log.date}.\n` +
        `Vui lòng kiểm tra hoặc liên hệ với y tá nếu cần thiết.\n
        \nTrân trọng,
        \nPIEDTEAM 👨‍⚕️`;

      // Gửi email cho phụ huynh
      await sendEmail(log.parent_email, subject, message);
    }

    // Ghi log sau khi xử lý xong
    console.log(`✅ Đã gửi thông báo cho ${logs.length} phụ huynh.`);
  } catch (error) {
    // Xử lý lỗi
    console.error("❌ Lỗi khi kiểm tra nhật ký thuốc:", error);
  }
};

// Hàm lấy nhật ký uống thuốc theo ID yêu cầu
const getLogsByRequestIdAndUserId = async (req, res) => {
  const user_id = req.user?.user_id;
  const { id_req } = req.params;
  const pool = await sqlServerPool;

  try {
    const result = await pool.request().input("id_req", sql.Int, id_req).input("nurse_id", sql.Int, user_id).query(`
        SELECT 
          log.*,
          stu.full_name,
          stu.class_name,
          u.fullname AS parent_name,
          u.phone AS parent_phone,
          u.email AS parent_email
        FROM Medication_Daily_Log log
        JOIN Medication_Submisstion_Request req ON log.id_req = req.id_req
        JOIN Student_Information stu ON req.student_id = stu.student_id
        JOIN Users u ON req.parent_id = u.user_id
        WHERE log.id_req = @id_req AND u.user_id = @user_id
        ORDER BY log.date ASC;
      `);

    res.status(200).json({ status: "success", data: result.recordset });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// Hàm lấy nhật ký uống thuốc theo ID yêu cầu
const getLogsByRequestIdAndUserIdAndStudentId = async (req, res) => {
  const user_id = req.user?.user_id;
  const { id_req, student_id } = req.params;
  const pool = await sqlServerPool;
  try {
    const idReqInt = parseInt(id_req);
    const studentIdInt = parseInt(student_id);

    const result = await pool
      .request()
      .input("id_req", sql.Int, idReqInt)
      .input("user_id", sql.Int, user_id)
      .input("student_id", sql.Int, studentIdInt).query(`
        SELECT 
          log.*,
          stu.full_name,
          stu.class_name,
          u.fullname AS parent_name,
          u.phone AS parent_phone,
          u.email AS parent_email
        FROM Medication_Daily_Log log
        JOIN Medication_Submisstion_Request req ON log.id_req = req.id_req
        JOIN Student_Information stu ON req.student_id = stu.student_id
        JOIN Users u ON req.parent_id = u.user_id
        WHERE log.id_req = @id_req AND u.user_id = @user_id AND req.student_id = @student_id
        ORDER BY log.date ASC;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        status: "not_found",
        message: "Không tìm thấy log nào cho yêu cầu này.",
      });
    }

    res.status(200).json({ status: "success", data: result.recordset });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// Hàm lấy nhật ký uống thuốc theo ID nhật ký
const getLogByLogId = async (req, res) => {
  const { log_id } = req.params; // ví dụ: /api/logs/1l;

  try {
    const result = await pool.request().input("log_id", sql.Int, log_id).query(`
        SELECT 
          log.*,
          stu.full_name,
          stu.class_name,
          u.fullname AS parent_name,
          u.phone AS parent_phone,
          u.email AS parent_email
        FROM Medication_Daily_Log log
        JOIN Medication_Submisstion_Request req ON log.id_req = req.id_req
        JOIN Student_Information stu ON req.student_id = stu.student_id
        JOIN Users u ON req.parent_id = u.user_id
        WHERE log.log_id = @log_id;
      `);

    if (result.recordset.length > 0) {
      res.status(200).json({ status: "success", data: result.recordset[0] });
    } else {
      res.status(404).json({ status: "fail", message: "Log not found" });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// Hàm lấy nhật ký uống thuốc theo ngày và ID y tá
const getLogsByDateAndNurse = async (req, res) => {
  const nurse_id = req.user?.user_id;
  const { date } = req.body;
  const pool = await sqlServerPool;

  try {
    const result = await pool.request().input("log_date", sql.Date, date).input("nurse_id", sql.Int, nurse_id).query(`
        SELECT 
          log.*,
          stu.full_name,
          stu.class_name,
          u.fullname AS parent_name,
          u.phone AS parent_phone,
          u.email AS parent_email
        FROM Medication_Daily_Log log
        JOIN Medication_Submisstion_Request req ON log.id_req = req.id_req
        JOIN Student_Information stu ON req.student_id = stu.student_id
        JOIN Users u ON req.parent_id = u.user_id
        WHERE CAST(log.date AS DATE) = @log_date AND log.nurse_id = @nurse_id
        ORDER BY log.date ASC;
      `);

    res.status(200).json({ status: "success", data: result.recordset });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// Export các controller ra module
module.exports = {
  updateStatusMedicationDailyLog,
  checkUnupdatedMedicationLogs,
  getLogsByRequestIdAndUserId,
  getLogByLogId,
  getLogsByDateAndNurse,
  getLogsByRequestIdAndUserIdAndStudentId,
};
