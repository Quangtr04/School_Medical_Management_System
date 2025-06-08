const sql = require("mssql");
const sqlServerPool = require("./connectMySql");

const getRole = async (role_name) => {
  try {
    const pool = await sqlServerPool;
    const result = await pool
      .request()
      .input("role_name", sql.NVarChar, role_name)
      .query("SELECT role_id FROM [Role] WHERE name = @role_name");

    if (result.recordset.length > 0) {
      return result.recordset[0];
    } else {
      throw new Error(`Role '${role_name}' not found`);
    }
  } catch (error) {
    console.error("Get role query failed:", error);
    throw new Error("Get role failed");
  }
};

module.exports = getRole;
