const sqlServerPool = require("../../Utils/connectMySql");
const sql = require("mssql");
const getRole = require("../../Utils/getRole");

const registerController = async (req, res, next) => {
  const { Information } = req.body.Information;

  const role_id = await getRole(Information.role_id);
  const pool = await sqlServerPool;

  const userInsertResult = await pool
    .request()
    .input("email", sql.NVarChar, Information.email)
    .input("phone", sql.NVarChar, Information.phone)
    .input("password", sql.NVarChar, Information.password)
    .input("role_id", sql.Int, role_id.role_id)
    .input("is_active", sql.Bit, 1)
    .query(
      `INSERT INTO [User] (email, phone, password, role_id, is_active) 
           OUTPUT INSERTED.user_id 
           VALUES (@email, @phone, @password, @role_id, @is_active)`
    );

  const user_id = userInsertResult.recordset[0].user_id;

  const infoInsertResult = await pool
    .request()
    .input("role_id", sql.Int, role_id.role_id)
    .input("user_id", sql.Int, user_id)
    .input("fullname", sql.NVarChar, Information.fullname)
    .input("dayofbirth", sql.Date, new Date(Information.dayofbirth))
    .input("major", sql.NVarChar, Information.major)
    .input("gender", sql.NVarChar, Information.gender)
    .input("phone", sql.NVarChar, Information.phone)
    .input("email", sql.NVarChar, Information.email)
    .input("address", sql.NVarChar, Information.address)
    .query(
      `INSERT INTO [Infomation] 
           (role_id, user_id, fullname, dayofbirth, major, gender, address, phone, email) 
           VALUES (@role_id, @user_id, @fullname, @dayofbirth, @major, @gender, @address, @phone, @email)`
    );
  if (infoInsertResult.rowsAffected[0] > 0) {
    res.status(200).json({
      status: "success",
      message: "User registered successfully",
      user_id: user_id,
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Registration failed",
    });
  }
};

module.exports = registerController;
