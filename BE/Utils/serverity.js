const sql = require("mssql");
const sqlServerPool = require("./connectMySql");

async function getServirityIdByName(serverity_name) {
  const pool = await sqlServerPool;
  const result = await pool
    .request()
    .input("serverity_name", sql.NVarChar, serverity_name)
    .query("SELECT serverity_id FROM Severity_Of_Incident WHERE UPPER(servirity) = UPPER(@serverity_name)");
  return result.recordset[0].serverity_id;
}

module.exports = {
  getServirityIdByName,
};
