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
    .input(
      "appointment_date",
      sql.DateTime,
      medicalSubmissionData.appointment_date
    )
    .query(
      `INSERT INTO Medication_Submission_Request (parent_id, student_id, status, note, appointment_date) 
             VALUES (@parent_id, @student_id, @status, @note, @appointment_date)`
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

const getAllMedicationSubmissionReq = async (req, res, next) => {
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

const updateMedicationSubmissionReqByParent = async (req, res, next) => {
  const submissionReqId = req.params.submissionId;
  const { note, appointment_date } = req.body;
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("note", sql.NVarChar, note)
    .input("appointment_date", sql.DateTime, new Date(appointment_date))
    .input("id_req", sql.Int, submissionReqId)
    .query(
      `UPDATE Medication_Submission_Request  
       SET note = @note, appointment_date = @appointment_date
       WHERE id_req = @id_req AND status = 'Pending'`
    );

  if (result.rowsAffected[0] > 0) {
    res.status(200).json({
      status: "success",
      message: "Medication submission updated successfully",
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Update failed. Only 'Pending' requests can be updated.",
    });
  }
};

const updateMedicationSubmissionReqByAdmin = async (req, res, next) => {
  const submissionReqId = req.params.submissionId;
  const { status } = req.body;
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("status", sql.Int, status)
    .input("id_req", sql.Int, submissionReqId)
    .query(
      `UPDATE Medication_Submission_Request  
       SET status = @status
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
  getAllMedicationSubmissionReq,
  updateMedicationSubmissionReqByParent,
  updateMedicationSubmissionReqByAdmin,
};
