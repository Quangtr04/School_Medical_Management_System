const sql = require("mssql");
const sqlServerPool = require("./connectMySql");

async function getServerityIdByName(serverity_name) {
  const pool = await sqlServerPool;
  const result = await pool
    .request()
    .input("serverity_name", sql.NVarChar, serverity_name)
    .query("SELECT serverity_id FROM Severity_Of_Incident WHERE UPPER(serverity) = UPPER(@serverity_name)");

  if (result.recordset.length > 0) {
    return result.recordset[0].serverity_id;
  } else {
    throw new Error(`Severity level '${serverity_name}' not found`);
  }
}

module.exports = {
  getServerityIdByName,
};
