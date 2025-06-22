const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");

const createMedicationDailyLog = async (req, res, next) => {
  const ReqId = req.params.ReqId;
  const medicationDailyLogData = req.body;
  try {
    const pool = await sqlServerPool;

    // check id req exist
    const checkReq = await pool
      .request()
      .input("id_req", sql.Int, ReqId)
      .query(
        `SELECT id_req FROM Medication_Submisstion_Request WHERE id_req = @id_req`
      );

    if (checkReq.recordset.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: `Request with id_req = ${ReqId} does not exist`,
      });
    }

    await pool
      .request()
      .input("id_req", sql.Int, ReqId)
      .input("nurse_id", sql.Int, medicationDailyLogData.nurse_id)
      .input("date", sql.DateTime, new Date())
      .input("status", sql.NVarChar, medicationDailyLogData.status)
      .input("note", sql.NVarChar, medicationDailyLogData.note)
      .input("updated_at", sql.DateTime, new Date())
      .input(
        "image_url",
        sql.NVarChar,
        medicationDailyLogData.image_url || null
      )
      .query(
        `INSERT INTO Medication_Daily_Log 
         (id_req, nurse_id, date, status, note, updated_at, image_url) 
         VALUES (@id_req, @nurse_id, @date, @status, @note, @updated_at, @image_url)`
      );

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

const updateStatusMedicationDailyLog = async (req, res, next) => {
  const ReqId = req.params.ReqId;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      status: "fail",
      message: "Missing required field: status",
    });
  }

  try {
    const pool = await sqlServerPool;

    // check log exist
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

    // update log
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

module.exports = {
  createMedicationDailyLog,
  updateStatusMedicationDailyLog,
};
