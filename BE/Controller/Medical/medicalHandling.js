const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const { stat } = require("fs");

const medicalHandling = async (req, res, next) => {
  const medicalHandlingData = req.body;
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("type", sql.NVarChar, medicalHandlingData.type)
    .input("id_req", sql.NVarChar, medicalHandlingData.id_req)
    .input("status", sql.Int, medicalHandlingData.status)
    .input("handled_at", sql.Int, medicalHandlingData.handled_at)
    .query(
      `INSERT INTO Handling_Medicine (id_req, status, handled_at) 
             VALUES (@id_req, @status, @handled_at)`
    );

  if (result.rowsAffected.length > 0) {
    res.status(200).json({
      status: "success",
      message: "Medical handling added successfully",
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Failed to add medical handling",
    });
  }
};

const getAllMedicalHandling = async (req, res, next) => {
  const pool = await sqlServerPool;
  const result = await pool.request().query("SELECT * FROM Handling_Medicine");
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

const getMedicalHandlingByID = async (req, res, next) => {
  const handlingId = req.params.handlingId;
  const pool = await sqlServerPool;
  const result = await pool
    .request()
    .input("id_handling", sql.Int, handlingId)
    .query("SELECT * FROM Handling_Medicine WHERE id_handling = @id_handling");

  if (result.recordset.length > 0) {
    res.status(200).json({
      status: "success",
      data: result.recordset[0],
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Handling not found",
    });
  }
};

const updateMedicalHandling = async (req, res, next) => {
  const handlingId = req.params.handlingId;
  const { status, handled_at } = req.body;
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("id_handling", sql.Int, handlingId)
    .input("status", sql.Int, status)
    .input("handled_at", sql.Int, handled_at)
    .query(
      `UPDATE Handling_Medicine 
             SET status = @status, handled_at = @handled_at 
             WHERE id_handling = @id_handling`
    );

  if (result.rowsAffected.length > 0) {
    res.status(200).json({
      status: "success",
      message: "Medical handling updated successfully",
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Failed to update medical handling",
    });
  }
};
module.exports = {
  medicalHandling,
  getAllMedicalHandling,
  getMedicalHandlingByID,
  updateMedicalHandling,
};
