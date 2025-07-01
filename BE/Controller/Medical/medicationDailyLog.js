// Import các thư viện và module cần thiết
const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");

// Hàm tạo một Medication Daily Log mới (ghi nhật ký uống thuốc hằng ngày)
const createMedicationDailyLog = async (req, res, next) => {
  const ReqId = req.params.ReqId; // ID của yêu cầu uống thuốc
  const medicationDailyLogData = req.body; // Dữ liệu từ client

  try {
    const pool = await sqlServerPool;

    // 1. Kiểm tra xem id_req có tồn tại trong bảng Medication_Submisstion_Request hay không
    const checkReq = await pool
      .request()
      .input("id_req", sql.Int, ReqId)
      .query(
        `SELECT id_req FROM Medication_Submisstion_Request WHERE id_req = @id_req`
      );

    if (checkReq.recordset.length === 0) {
      // Nếu không tìm thấy yêu cầu, trả về lỗi
      return res.status(404).json({
        status: "fail",
        message: `Request with id_req = ${ReqId} does not exist`,
      });
    }

    // 2. Thêm bản ghi mới vào bảng Medication_Daily_Log
    await pool
      .request()
      .input("id_req", sql.Int, ReqId)
      .input("nurse_id", sql.Int, medicationDailyLogData.nurse_id)
      .input("date", sql.DateTime, new Date()) // Ghi nhận thời gian hiện tại
      .input("status", sql.NVarChar, medicationDailyLogData.status)
      .input("note", sql.NVarChar, medicationDailyLogData.note)
      .input("updated_at", sql.DateTime, new Date())
      .input(
        "image_url",
        sql.NVarChar,
        medicationDailyLogData.image_url || null // Có thể không có ảnh
      )
      .query(
        `INSERT INTO Medication_Daily_Log 
         (id_req, nurse_id, date, status, note, updated_at, image_url) 
         VALUES (@id_req, @nurse_id, @date, @status, @note, @updated_at, @image_url)`
      );

    // 3. Gửi thông báo cho phụ huynh nếu có parent_id tương ứng với id_req
    const result2 = await pool.request().input("id_req", sql.Int, ReqId).query(`
      SELECT parent_id FROM Medication_Submisstion_Request WHERE id_req = @id_req
    `);

    const parentId = result2.recordset[0]?.parent_id;

    if (parentId) {
      await sendNotification(
        pool,
        parentId,
        "Thông báo uống thuốc",
        `Học sinh đã được uống thuốc`
      );
    }

    // 4. Trả về phản hồi thành công
    res.status(200).json({
      status: "success",
      message: "Medication Daily Log added successfully",
    });
  } catch (error) {
    console.error("Error inserting Medication Daily Log:", error);
    res.status(500).json({
      status: "error",
      message: "Server error while inserting Medication Daily Log",
    });
  }
};

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

// Export các controller ra module
module.exports = {
  createMedicationDailyLog,
  updateStatusMedicationDailyLog,
};
