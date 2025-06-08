const sql = require("mssql");
const sqlServerPool = require("../Utils/connectMySql");

const getRole = async (req, res, next) => {
  const { role_name } = req.body;

  const pool = await sqlServerPool;
  const result = await pool
    .request()
    .input("role_name", sql.NVarChar, role_name)
    .query("SELECT role_id FROM [Role] WHERE name = @role_name");

  if (result.recordset.length > 0) {
    res.status(200).json({
      status: "success",
      role_id: result.recordset[0].role_id,
    });
  } else {
    res
      .status(404)
      .json({ status: "fail", message: `Role '${role_name}' not found` });
  }
};

module.exports = getRole;
