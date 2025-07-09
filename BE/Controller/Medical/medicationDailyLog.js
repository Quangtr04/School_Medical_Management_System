// Import các thư viện và module cần thiết
const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const sendEmail = require("../../Utils/sendEmail"); // Hàm gửi email qua Gmail

// Hàm cập nhật trạng thái nhật ký uống thuốc
const updateStatusMedicationDailyLog = async (req, res, next) => {
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

    // 2. Kiểm tra xem nhật ký có tồn tại với id_req không
    const checkLog = await pool
      .request()
      .input("id_req", sql.Int, ReqId)
      .query("SELECT id_req FROM Medication_Daily_Log WHERE id_req = @id_req");

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

// Hàm lấy nhật ký uống thuốc theo ID yêu cầu và ID y tá
const getLogsByRequestIdAndNurse = async (req, res) => {
  const { id_req, nurse_id } = req.query;
  const pool = await sqlServerPool;

  try {
    const result = await pool
      .request()
      .input("id_req", sql.Int, id_req)
      .input("nurse_id", sql.Int, nurse_id).query(`
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
        WHERE log.id_req = @id_req AND req.nurse_id = @nurse_id
        ORDER BY log.date ASC;
      `);

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
  const { date, nurse_id } = req.query;
  const pool = await sqlServerPool;

  try {
    const result = await pool
      .request()
      .input("log_date", sql.Date, date)
      .input("nurse_id", sql.Int, nurse_id).query(`
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
  getLogsByRequestIdAndNurse,
  getLogByLogId,
  getLogsByDateAndNurse,
};
