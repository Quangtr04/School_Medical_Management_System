const sqlServerPool = require("../Utils/connectMySql");
const sql = require("mssql");
const getRole = require("../Controller/getRole");

const registerController = async (Infomation) => {
  try {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(Infomation.email)) {
      throw new Error("Invalid email format. Only '@gmail.com' is accepted.");
    }

    const role_id = await getRole(Infomation.role_name);
    const pool = await sqlServerPool;

    const userInsertResult = await pool
      .request()
      .input("email", sql.NVarChar, Infomation.email)
      .input("phone", sql.NVarChar, Infomation.phone)
      .input("password", sql.NVarChar, Infomation.password)
      .input("role_id", sql.Int, role_id.role_id)
      .query(
        `INSERT INTO [User] (email, phone, password, role_id) 
           OUTPUT INSERTED.user_id 
           VALUES (@email, @phone, @password, @role_id)`
      );

    const user_id = userInsertResult.recordset[0].user_id;

    const infoInsertResult = await pool
      .request()
      .input("role_id", sql.Int, role_id.role_id)
      .input("user_id", sql.Int, user_id)
      .input("fullname", sql.NVarChar, Infomation.fullname)
      .input("dayofbirth", sql.Date, new Date(Infomation.dayofbirth))
      .input("major", sql.NVarChar, Infomation.major)
      .input("gender", sql.NVarChar, Infomation.gender)
      .input("phone", sql.NVarChar, Infomation.phone)
      .input("email", sql.NVarChar, Infomation.email)
      .input("address", sql.NVarChar, Infomation.address)
      .query(
        `INSERT INTO [Infomation] 
           (role_id, user_id, fullname, dayofbirth, major, gender, address, phone, email) 
           VALUES (@role_id, @user_id, @fullname, @dayofbirth, @major, @gender, @address, @phone, @email)`
      );

    return {
      message: "User registered successfully",
      user_id: user_id,
      info: infoInsertResult.recordset,
    };
  } catch (error) {
    console.error("Register user failed:", error.message);
    throw new Error("Register user failed: " + error.message);
  }
};

module.exports = registerController;
