// Import các thư viện và module cần thiết
const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");

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
  updateStatusMedicationDailyLog,
};
