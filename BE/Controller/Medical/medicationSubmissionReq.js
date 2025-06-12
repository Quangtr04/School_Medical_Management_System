const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const { stat } = require("fs");

const medicalSubmissionReq = async (req, res, next) => {
  const medicalSubmissionData = req.body;
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("parent_id", sql.NVarChar, medicalSubmissionData.parent_id)
    .input("student_id", sql.Int, medicalSubmissionData.student_id)
    .input("status", sql.DateTime, new Date(medicalSubmissionData.status))
    .input("note", sql.NVarChar, medicalSubmissionData.note)
    .query(
      `INSERT INTO Medication_Submission_Request (parent_id, student_id, status, note) 
             VALUES (@parent_id, @student_id, @status, @note)`
    );

  if (result.rowsAffected.length > 0) {
    res.status(200).json({
      status: "success",
      message: "Medication submission request added successfully",
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Failed to add medication submission request",
    });
  }
};

const getAllMedicationSubmissions = async (req, res, next) => {
  const pool = await sqlServerPool;
  const result = await pool
    .request()
    .query("SELECT * FROM Medication_Submission_Request");
  if (result.recordset.length > 0) {
    res.status(200).json({
      status: "success",
      data: result.recordset,
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Something went wrong",
    });
  }
};

const updateMedicationSubmission = async (req, res, next) => {
  const submissionId = req.params.submissionId;
  const { status, note } = req.body;
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("status", sql.DateTime, new Date(status))
    .input("note", sql.NVarChar, note)
    .query(
      `UPDATE Medication_Submission_Request  
       SET status = @status, note = @note 
       WHERE id_req = @id_req`
    );

  if (result.rowsAffected.length > 0) {
    res.status(200).json({
      status: "success",
      message: "Medication submission updated successfully",
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Failed to update medication submission",
    });
  }
};

module.exports = {
  medicalSubmissionReq,
  getAllMedicationSubmissions,
  updateMedicationSubmission,
};
