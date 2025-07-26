// Import các thư viện và module cần thiết
const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const sendEmail = require("../../Utils/mailer");
const sendNotification = require("../../Utils/sendNotification");

// Hàm chuẩn hóa ngày về múi giờ Việt Nam (GMT+7)
function normalizeDateVN(dateInput) {
  let date;
  if (dateInput instanceof Date) {
    date = new Date(dateInput.getTime());
  } else if (typeof dateInput === "string") {
    date = new Date(dateInput);
  } else {
    throw new Error("Invalid date input");
  }
  const offset = 7 * 60 * 60 * 1000; // Cộng thêm 7 tiếng
  return new Date(date.getTime() + offset);
}

// Hàm cập nhật trạng thái nhật ký uống thuốc
const updateStatusMedicationDailyLog = async (req, res, next) => {
  const nurse_id = req.user?.user_id;
  const Logid = req.params.Logid;
  const { status } = req.body;

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

    // Kiểm tra log
    const checkLog = await pool
      .request()
      .input("log_id", sql.Int, Logid)
      .input("nurse_id", sql.Int, nurse_id)
      .query("SELECT log_id, id_req FROM Medication_Daily_Log WHERE log_id = @log_id AND nurse_id = @nurse_id");

    if (checkLog.recordset.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: `No Medication Daily Log found with log_id = ${Logid}`,
      });
    }

    const ReqId = checkLog.recordset[0].id_req;

    // Cập nhật trạng thái và thời gian
    await pool
      .request()
      .input("log_id", sql.Int, Logid)
      .input("status", sql.NVarChar, status)
      .input("updated_at", sql.DateTime, normalizeDateVN(new Date())).query(`
        UPDATE Medication_Daily_Log 
        SET status = @status, 
            updated_at = @updated_at 
        WHERE log_id = @log_id
      `);

    // Lấy thông tin phụ huynh
    const parentInfo = await pool.request().input("id_req", sql.Int, ReqId).query(`
        SELECT u.user_id AS parent_id, u.email, u.fullname
        FROM Medication_Submisstion_Request r
        JOIN Users u ON r.parent_id = u.user_id
        WHERE r.id_req = @id_req
      `);

    const parent = parentInfo.recordset[0];
    if (!parent) {
      return res.status(404).json({
        status: "fail",
        message: "Parent information not found",
      });
    }

    let notifyTitle = "Cập nhật trạng thái uống thuốc";
    let notifyMessage = "";
    let emailSubject = "📢 Thông báo cập nhật uống thuốc";
    let emailContent = "";

    if (status === "GIVEN") {
      notifyMessage = "Y tá đã xác nhận học sinh đã được uống thuốc.";
      emailContent = `Kính gửi quý phụ huynh ${parent.fullname},\n\nY tá đã cập nhật rằng học sinh đã được uống thuốc đúng theo yêu cầu trong hôm nay.\n\nTrân trọng,\nBan Y Tế Nhà Trường.`;
    } else if (status === "NOT GIVEN") {
      notifyMessage = "Y tá đã cập nhật rằng học sinh chưa được uống thuốc.";
      emailContent = `Kính gửi quý phụ huynh ${parent.fullname},\n\nHệ thống ghi nhận rằng học sinh chưa được uống thuốc theo yêu cầu trong hôm nay.\nVui lòng liên hệ với y tế nhà trường nếu cần hỗ trợ thêm.\n\nTrân trọng,\nBan Y Tế Nhà Trường.`;
    }

    // Gửi thông báo
    await sendNotification(pool, parent.parent_id, notifyTitle, notifyMessage);

    // Gửi email
    if (parent.email) {
      await sendEmail(parent.email, emailSubject, emailContent);
    }

    return res.status(200).json({
      status: "success",
      message: "Medication Daily Log status updated successfully",
    });
  } catch (error) {
    console.error("Error updating Medication Daily Log status:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error while updating Medication Daily Log status",
    });
  }
};

// Hàm kiểm tra và gửi email nếu chưa cập nhật uống thuốc
const checkUnupdatedMedicationLogs = async () => {
  try {
    const pool = await sqlServerPool;

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
        log.date = CAST(GETDATE() AS DATE)
        AND log.status = 'PENDING'
        AND log.image_url IS NULL
        AND CAST(GETDATE() AS TIME) > '18:00:00'
    `);

    const logs = result.recordset;

    for (const log of logs) {
      const { parent_email, parent_name, parent_id, date } = log;

      const emailSubject = "Thông tin cập nhật liên quan đến nhật ký uống thuốc";
      const emailContent =
        `Kính gửi quý phụ huynh ${parent_name},\n\n` +
        `Chúng tôi xin thông báo rằng hiện tại y tá vẫn chưa cập nhật trạng thái và hình ảnh xác nhận việc uống thuốc cho học sinh vào ngày ${date}.\n\n` +
        `Nếu quý phụ huynh có bất kỳ thắc mắc nào, xin vui lòng liên hệ với y tá hoặc nhà trường để được hỗ trợ.\n\n` +
        `Trân trọng,\nBan Y Tế Nhà Trường`;

      const notifyTitle = "Thông tin nhật ký uống thuốc chưa được cập nhật";
      const notifyMessage =
        "Nhật ký uống thuốc của học sinh hôm nay hiện chưa được cập nhật trạng thái và hình ảnh xác nhận từ y tá.";

      if (parent_email) {
        await sendEmail(parent_email, emailSubject, emailContent);
      }

      if (parent_id) {
        await sendNotification(pool, parent_id, notifyTitle, notifyMessage);
      }
    }

    console.log(`📩 Đã gửi thông báo nhắc nhở cho ${logs.length} phụ huynh.`);
  } catch (error) {
    console.error("⚠️ Lỗi khi gửi thông báo nhắc nhở nhật ký thuốc:", error);
  }
};

// Hàm lấy nhật ký uống thuốc theo ID yêu cầu
const getLogsByRequestIdAndUserId = async (req, res) => {
  const user_id = req.user?.user_id;
  const { id_req } = req.params;
  const pool = await sqlServerPool;

  try {
    const result = await pool.request().input("id_req", sql.Int, id_req).input("user_id", sql.Int, user_id).query(`
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
        JOIN Users u ON req.nurse_id = u.user_id
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
