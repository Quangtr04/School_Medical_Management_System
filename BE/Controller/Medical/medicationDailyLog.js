const sql   = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");

const createMedicationDailyLog = async (req, res, next) => {
  const ReqId = req.params.ReqId;  
  const medicationDailyLogData = req.body;
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("id_req", sql.Int, ReqId)
    .input("parent_id", sql.Int, medicationDailyLogData.parent_id)
    .input("student_id", sql.NVarChar, medicationDailyLogData.student_id)
    .input("nurse_id", sql.Int, medicationDailyLogData.nurse_id)
    .input("status", sql.NVarChar, medicationDailyLogData.status)
    .input("note", sql.NVarChar, medicationDailyLogData.note)
    .input("image_url", sql.NVarChar, medicationDailyLogData.image_url)
    .input("start_date", sql.Date, medicationDailyLogData.start_date)
    .input("end_date", sql.Date, medicationDailyLogData.end_date)
    .query(
      `INSERT INTO Medication_Daily_Log (nurse_id, student_id, status, start_date, end_date, note, image_url) 
              VALUES (@nurse_id, @student_id, @status, @start_date, @end_date, @note, @image_url)`
    );

  if (result.rowsAffected.length > 0) {
    res.status(200).json({
      status: "success",
      message: "Medication Daily Log added successfully",
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Failed to add Medication Daily Log",
    });
  }
}  