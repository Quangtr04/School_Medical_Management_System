const sqlServerPool = require("../../Utils/connectMySql");
const sql = require("mssql");
const { getRoleIdByName } = require("../../Utils/getRoleUtils");

const registerController = async (req, res, next) => {
  try {
    const Information = req.body;

    const role_id = await getRoleIdByName(Information.role_name);
    if (!role_id) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid role name provided.",
      });
    }

    Information.role_id = role_id;

    const pool = await sqlServerPool;

    // 1. Insert into [User]
    const userInsertResult = await pool
      .request()
      .input("email", sql.NVarChar, Information.email)
      .input("phone", sql.NVarChar, Information.phone)
      .input("password", sql.NVarChar, Information.password)
      .input("role_id", sql.Int, Information.role_id)
      .input("is_active", sql.Bit, 1)
      .query(
        `INSERT INTO [Users] (email, phone, password, role_id, is_active) 
         OUTPUT INSERTED.user_id 
         VALUES (@email, @phone, @password, @role_id, @is_active)`
      );

    const user_id = userInsertResult.recordset[0].user_id;

    // 2. Insert into [Infomation]
    const infoInsertResult = await pool
      .request()
      .input("role_id", sql.Int, Information.role_id)
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
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = registerController;
