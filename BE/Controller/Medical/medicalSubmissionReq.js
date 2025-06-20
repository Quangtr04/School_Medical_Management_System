const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const { stat } = require("fs");

const medicalSubmissionReq = async (req, res, next) => {
  const medicalSubmissionReqData = req.body;
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("parent_id", sql.Int, medicalSubmissionReqData.parent_id)
    .input("student_id", sql.NVarChar, medicalSubmissionReqData.student_id)
    .input("nurse_id", sql.Int, medicalSubmissionReqData.nurse_id)
    .input("status", sql.NVarChar, medicalSubmissionReqData.status)
    .input("note", sql.NVarChar, medicalSubmissionReqData.note)
    .input("image_url", sql.NVarChar, medicalSubmissionReqData.image_url)
    .input("start_date", sql.Date, medicalSubmissionReqData.start_date)
    .input("end_date", sql.Date, medicalSubmissionReqData.end_date)
    .query(
      `INSERT INTO Medication_Submisstion_Request (nurse_id, student_id, status, start_date, end_date, note, image_url) 
             VALUES (@nurse_id, @student_id, @status, @start_date, @end_date, @note, @image_url)`
    );

  if (result.rowsAffected.length > 0) {
    res.status(200).json({
      status: "success",
      message: "medicalSubmissionReq added successfully",
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Failed to add medicalSubmissionReq",
    });
  }
};

const getAllMedicalSubmissionReq = async (req, res, next) => {
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

const getMedicalSubmissionReqByID = async (req, res, next) => {
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
      message: "medicalSubmissionReq not found",
    });
  }
};

const updateMedicalSubmissionReq = async (req, res, next) => {
  const ReqId = req.params.ReqId;
  const { status, handled_at } = req.body;
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("id_req", sql.Int, ReqId)
    .input("status", sql.NVarChar, status)
    .input("note", sql.NVarChar, medicalSubmissionReqData.note)
    .input("image_url", sql.NVarChar, medicalSubmissionReqData.image_url)
    .input("start_date", sql.Date, medicalSubmissionReqData.start_date)
    .input("end_date", sql.Date, medicalSubmissionReqData.end_date)
    .query(
      `UPDATE Medication_Submisstion_Request
             SET status = @status, handled_at = @handled_at
             WHERE id_req = @id_req`
    );

  if (result.rowsAffected.length > 0) {
    res.status(200).json({
      status: "success",
      message: "medicalSubmissionReq updated successfully",
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Failed to update medicalSubmissionReq",
    });
  }
};
module.exports = {
  medicalSubmissionReq,
  getAllMedicalSubmissionReq,
  getMedicalSubmissionReqByID,
  updateMedicalSubmissionReq,
};
