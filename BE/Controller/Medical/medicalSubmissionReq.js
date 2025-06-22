const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");


const medicationSubmissionReq = async (req, res, next) => {
  const medicationSubmissionReqData = req.body;
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("parent_id", sql.Int, medicationSubmissionReqData.parent_id)
    .input("student_id", sql.NVarChar, medicationSubmissionReqData.student_id)
    .input("status", sql.NVarChar, medicationSubmissionReqData.status)
    .input("created_at", sql.DateTime, new Date())
    .input("nurse_id", sql.Int, medicationSubmissionReqData.nurse_id)    
    .input("note", sql.NVarChar, medicationSubmissionReqData.note)
    .input("image_url", sql.NVarChar, medicationSubmissionReqData.image_url)
    .input("start_date", sql.Date, medicationSubmissionReqData.start_date)
    .input("end_date", sql.Date, medicationSubmissionReqData.end_date)
    .query(
      `INSERT INTO Medication_Submisstion_Request (parent_id, student_id, status, created_at, nurse_id, note, image_url, start_date, end_date)
       VALUES (@parent_id, @student_id, @status, @created_at, @nurse_id, @note, @image_url, @start_date, @end_date)`
    );

  if (result.rowsAffected.length > 0) {
    res.status(200).json({
      status: "success",
      message: "medicationSubmissionReq added successfully",
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Failed to add medicationSubmissionReq",
    });
  }
};

const getAllMedicationSubmissionReq = async (req, res, next) => {
  const pool = await sqlServerPool;
  const result = await pool.request().query("SELECT * FROM Medication_Submisstion_Request");
  if (result.recordset.length > 0) {
    res.status(200).json({
      status: "success",
      data: result.recordset,
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Some thing went wrong",
    });
  }
};

const getMedicationSubmissionReqByID = async (req, res, next) => {
  const ReqId = req.params.ReqId;
  const pool = await sqlServerPool;
  const result = await pool
    .request()
    .input("id_req", sql.Int, ReqId)
    .query("SELECT * FROM Medication_Submisstion_Request WHERE id_req = @id_req");

  if (result.recordset.length > 0) {
    res.status(200).json({
      status: "success",
      data: result.recordset[0],
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "medicationSubmissionReq not found",
    });
  }
};

const updateMedicationSubmissionReq = async (req, res, next) => {
  const ReqId = req.params.ReqId;
  const { status, image_url } = req.body;
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("id_req", sql.Int, ReqId)
    .input("status", sql.NVarChar, status)
    .input("image_url", sql.NVarChar, image_url)
    .query(
      `UPDATE Medication_Submisstion_Request
             SET status = @status,
                 image_url = @image_url
             WHERE id_req = @id_req`
    );
  
    
  if (result.rowsAffected.length > 0) {
    res.status(200).json({
      status: "success",
      message: "medicationSubmissionReq updated successfully",
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Failed to update medicationSubmissionReq",
    });
  }
};
module.exports = {
  medicationSubmissionReq,
  getAllMedicationSubmissionReq,
  getMedicationSubmissionReqByID,
  updateMedicationSubmissionReq
};
