const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const { stat } = require("fs");

const medicalSupplies = async (req, res, next) => {
  const medicalSupplyData = req.body;
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("parent_id", sql.Int, medicalSupplyData.parent_id)
    .input("student_id", sql.Int, medicalSupplyData.student_id)
    .input("name", sql.NVarChar, medicalSupplyData.name)
    .input("type", sql.NVarChar, medicalSupplyData.type)
    .input("unit", sql.NVarChar, medicalSupplyData.unit)
    .input("quantity", sql.Int, medicalSupplyData.quantity)
    .input("description", sql.NVarChar, medicalSupplyData.description)
    .input(
      "expired_date",
      sql.DateTime,
      new Date(medicalSupplyData.expired_date)
    )
    .input("is_active", sql.Int, medicalSupplyData.is_active)
    .input("nurse_id", sql.Int, medicalSupplyData.nurse_id)
    .input("usage_note", sql.NVarChar, medicalSupplyData.usage_note)
    .query(
      `INSERT INTO Medical_Supply (parent_id, student_id, name, quantity, type, unit, description, expired_date, is_active, nurse_id, usage_note) 
            VALUES (@parent_id, @student_id, @name, @quantity, @type, @unit, @description, @expired_date, @is_active, @nurse_id, @usage_note)`
    );

  if (result.rowsAffected.length > 0) {
    res.status(200).json({
      status: "success",
      message: "Medical supply added successfully",
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Failed to add medical supply",
    });
  }
};

const getAllMedicalSupplies = async (req, res, next) => {
  const pool = await sqlServerPool;
  const result = await pool.request().query("SELECT * FROM Medical_Supply");
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

const getMedicalSuppliesByID = async (req, res, next) => {
  const supplyid = req.param.supplyid;
  const pool = await sqlServerPool;
  const result = await pool
    .request()
    .input("supplyid", sql.Int, supplyid)
    .query("SELECT * FROM Medical_Supply WHERE supply_id = @supplyid");
  if (result.recordset.length > 0) {
    res.status(200).json({
      status: "success",
      data: result.recordset[0],
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Some thing went wrong",
    });
  }
};

const FindlMedicalSuppliesByName = async (req, res, next) => {
  const nameMedical = req.body;
  const pool = await sqlServerPool;
  const result = await pool
    .request()
    .input("nameMedical", sql.NVarChar, nameMedical)
    .query("SELECT * FROM Medical_Supply WHERE name = @nameMedical");
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

const medicalUpdateById = async (req, res, next) => {
  const supply_id = req.param.supplyid;
  const newUpdate = req.body;
  const pool = await sqlServerPool;
  const medical = await pool.request();

  medical
    .input("supplyid", sql.Int, supply_id)
    .input("unit", sql.NVarChar, newUpdate.unit)
    .input("quantity", sql.Int, newUpdate.quantity)
    .input("is_active", sql.Int, newUpdate.is_active)
    .input("expired_date", sql.DateTime, new Date(newUpdate.expired_date))
    .query(
      `UPDATE Medical_Supply SET unit = @unit, quantity = @quantity, expired_date = @expired_date, is_active = @is_active WHERE supply_id = @supplyid`
    );

  if (medical.rowsAffected.length > 0) {
    res.status(200).json({
      status: "success",
      message: "Medical supply updated successfully",
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Failed to update medical supply",
    });
  }
};

module.exports = {
  medicalSupplies,
  getAllMedicalSupplies,
  getMedicalSuppliesByID,
  FindlMedicalSuppliesByName,
  medicalUpdateById,
};
l2;
