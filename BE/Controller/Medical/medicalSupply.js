const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");

const medicalSupply = async (req, res, next) => {
  const medicalSupplyData = req.body;
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("name", sql.NVarChar, medicalSupplyData.name)
    .input("type", sql.NVarChar, medicalSupplyData.type)
    .input("unit", sql.NVarChar, medicalSupplyData.unit)
    .input("quantity", sql.Int, medicalSupplyData.quantity)
    .input("description", sql.NVarChar, medicalSupplyData.description)
    .input("expired_date", sql.Date, medicalSupplyData.expired_date)
    .input("is_active", sql.Bit, medicalSupplyData.is_active)
    .input("usage_note", sql.NVarChar, medicalSupplyData.usage_note)
    .query(
      `INSERT INTO Medical_Supply (name, type, unit, quantity, description, expired_date, is_active, usage_note)
       VALUES (@name, @type, @unit, @quantity, @description, @expired_date, @is_active, @usage_note)`
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
}

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
      message: "No medical supplies found",
    });
  }
};

const getMedicalSupplyByID = async (req, res, next) => {
  const supplyId = req.params.supplyId;
  const pool = await sqlServerPool;
  
  const result = await pool
    .request()
    .input("supply_id", sql.Int, supplyId)
    .query("SELECT * FROM Medical_Supply WHERE supply_id = @supply_id");
  
  if (result.recordset.length > 0) {
    res.status(200).json({
      status: "success",
      data: result.recordset[0],
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Medical supply not found",
    });
  } 
}

const updateMedicalSupply = async (req, res, next) => {
  const supplyId = req.params.supplyId;
  const medicalSupplyData = req.body;
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("supply_id", sql.Int, supplyId)
    .input("quantity", sql.Int, medicalSupplyData.quantity)
    .input("expired_date", sql.Date, medicalSupplyData.expired_date)
    .input("is_active", sql.Bit, medicalSupplyData.is_active)
    .query(
      `UPDATE Medical_Supply
       SET quantity = @quantity,
           expired_date = @expired_date,
           is_active = @is_active
       WHERE supply_id = @supply_id`
    );

  if (result.rowsAffected.length > 0) {
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

const deleteMedicalSupply = async (req, res, next) => {
  const supplyId = req.params.supplyId;
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("supply_id", sql.Int, supplyId)
    .query("DELETE FROM Medical_Supply WHERE supply_id = @supply_id");

  if (result.rowsAffected.length > 0) {
    res.status(200).json({
      status: "success",
      message: "Medical supply deleted successfully",
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Failed to delete medical supply",
    });
  }            
}
// thong bao trong 7 ngay toi co thuoc nao het han
const getNearExpiryMedicalSupplies = async (req, res, next) => {
  try {
    const pool = await sqlServerPool;

    const result = await pool.request().query(`
      SELECT * 
      FROM Medical_Supply
      WHERE expired_date BETWEEN GETDATE() AND DATEADD(DAY, 7, GETDATE())
        AND is_active = 1
    `);

    res.status(200).json({
      status: "success",
      data: result.recordset,
      message:
        result.recordset.length > 0
          ? `${result.recordset.length} medical supplies will expire within 3 days.`
          : "No medical supplies are about to expire.",
    });
  } catch (error) {
    console.error("Near-expiry check error:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

module.exports = {
  medicalSupply,
  getAllMedicalSupplies,
  getMedicalSupplyByID,
  updateMedicalSupply,
  deleteMedicalSupply,
  getNearExpiryMedicalSupplies
}; 