const sql = require("mssql");
const sqlServerPool = require("./connectMySql");

async function getSupplyByName(supply_name) {
  const pool = await sqlServerPool;
  const result = await pool
    .request()
    .input("supply_name", sql.NVarChar, supply_name)
    .query("SELECT supply_id FROM Medical_Supply WHERE UPPER(name) = UPPER(@supply_name)");
  if (result.recordset.length > 0) {
    return result.recordset[0];
  } else {
    throw new Error(`Supply '${supply_name}' not found`);
  }
}

async function getSupplyById(supply_id) {
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("supply_id", sql.Int, supplyId)
    .query("SELECT * FROM Medical_Supply WHERE supply_id = @supply_id");

  if (result.recordset.length > 0) {
    return result.recordset[0]; // ✅ Trả về dữ liệu
  } else {
    return null; // ❌ Không tìm thấy
  }
}

module.exports = {
  getSupplyByName,
  getSupplyById,
};
