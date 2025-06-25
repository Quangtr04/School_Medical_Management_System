const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const sendNotification = require("../../Utils/sendNotification");

const medicationSubmissionReq = async (req, res, next) => {
  const medicationSubmissionReqData = req.body;
  const pool = await sqlServerPool;

  try {
    const result = await pool
      .request()
      .input("parent_id", sql.Int, medicationSubmissionReqData.parent_id)
      .input("student_id", sql.NVarChar, medicationSubmissionReqData.student_id)
      .input("status", sql.NVarChar, medicationSubmissionReqData.status)
      .input("created_at", sql.DateTime, new Date())
      .input("note", sql.NVarChar, medicationSubmissionReqData.note)
      .input("image_url", sql.NVarChar, medicationSubmissionReqData.image_url)
      .input("start_date", sql.Date, medicationSubmissionReqData.start_date)
      .input("end_date", sql.Date, medicationSubmissionReqData.end_date).query(`
        INSERT INTO Medication_Submisstion_Request 
        (parent_id, student_id, status, created_at, note, image_url, start_date, end_date)
        VALUES (@parent_id, @student_id, @status, @created_at, @note, @image_url, @start_date, @end_date)
      `);

    if (result.rowsAffected[0] > 0) {
      // tb đến y tá
      const nurses = await pool
        .request()
        .query("SELECT user_id FROM Users WHERE role_id = 3");

      for (const nurse of nurses.recordset) {
        await sendNotification(
          pool,
          nurse.user_id,
          "Yêu cầu uống thuốc mới",
          `Phụ huynh đã gửi yêu cầu uống thuốc cho học sinh có ID: ${medicationSubmissionReqData.student_id}`
        );
      }

      return res.status(200).json({
        status: "success",
        message: "medicationSubmissionReq added successfully",
      });
    } else {
      return res.status(400).json({
        status: "fail",
        message: "Failed to add medicationSubmissionReq",
      });
    }
  } catch (error) {
    console.error("Error creating medicationSubmissionReq:", error);
    res.status(500).json({
      status: "error",
      message: "Server error while creating medicationSubmissionReq",
    });
  }
};

const getAllMedicationSubmissionReq = async (req, res, next) => {
  const pool = await sqlServerPool;
  const result = await pool
    .request()
    .query("SELECT * FROM Medication_Submisstion_Request");
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

const getMedicationSubmissionReqByID = async (req, res, next) => {
  const ReqId = req.params.ReqId;
  const pool = await sqlServerPool;
  const result = await pool
    .request()
    .input("id_req", sql.Int, ReqId)
    .query(
      "SELECT * FROM Medication_Submisstion_Request WHERE id_req = @id_req"
    );

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

const updateMedicationSubmissionReqByNurse = async (req, res, next) => {
  const ReqId = req.params.ReqId;
  const { status } = req.body;
  const pool = await sqlServerPool;

  try {
    const result = await pool
      .request()
      .input("id_req", sql.Int, ReqId)
      .input("status", sql.NVarChar, status).query(`
        UPDATE Medication_Submisstion_Request
        SET status = @status
        WHERE id_req = @id_req
      `);

    if (result.rowsAffected[0] > 0) {
      // tb cho phụ huynh
      const parentResult = await pool
        .request()
        .input("id_req", sql.Int, ReqId)
        .query(
          "SELECT parent_id FROM Medication_Submisstion_Request WHERE id_req = @id_req"
        );

      const parentId = parentResult.recordset[0]?.parent_id;
      if (parentId) {
        await sendNotification(
          pool,
          parentId,
          "Cập nhật trạng thái yêu cầu thuốc",
          `Trạng thái yêu cầu uống thuốc đã được cập nhật thành: ${status}`
        );
      }

      return res.status(200).json({
        status: "success",
        message: "medicationSubmissionReq updated successfully",
      });
    } else {
      return res.status(400).json({
        status: "fail",
        message: "Failed to update medicationSubmissionReq",
      });
    }
  } catch (error) {
    console.error("Error updating medicationSubmissionReq:", error);
    res.status(500).json({
      status: "error",
      message: "Server error while updating medicationSubmissionReq",
    });
  }
};

module.exports = {
  medicationSubmissionReq,
  getAllMedicationSubmissionReq,
  getMedicationSubmissionReqByID,
  updateMedicationSubmissionReqByNurse,
};
