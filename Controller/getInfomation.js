const sql = require("mssql");
const sqlServerPool = require("../Utils/connectMySql");

const getParentInfo = async (user_id) => {
  try {
    const pool = await sqlServerPool;
    const result = await pool
      .request()
      .input("user_id", sql.Int, user_id)
      .query("SELECT * FROM [Infomation] WHERE user_id = @user_id");
    if (result.recordset.length > 0) {
      return result.recordset[0];
    }
  } catch (error) {
    console.error("Failed to get infomation parent:", error.message);
    throw new Error("Failed to get infomation parent: " + error.message);
  }
};

module.exports = {
  getParentInfo,
};
