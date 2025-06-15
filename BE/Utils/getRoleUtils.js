const sql = require("mssql");
const sqlServerPool = require("./connectMySql");

async function getRoleIdByName(role_name) {
  const pool = await sqlServerPool;
  const result = await pool
    .request()
    .input("role_name", sql.NVarChar, role_name)
    .query("SELECT role_id FROM Role WHERE UPPER(name) = UPPER(@role_name)");

  if (result.recordset.length > 0) {
    return result.recordset[0].role_id;
  } else {
    throw new Error(`Role '${role_name}' not found`);
  }
}

async function getRoleNameById(role_id) {
  const pool = await sqlServerPool;
  const result = await pool
    .request()
    .input("role_id", sql.NVarChar, role_id)
    .query("SELECT name FROM [Role] WHERE role_id = @role_id");

  if (result.recordset.length > 0) {
    return result.recordset[0].name;
  } else {
    throw new Error(`Role '${role_id}' not found`);
  }
}

module.exports = {
  getRoleIdByName,
  getRoleNameById,
};
