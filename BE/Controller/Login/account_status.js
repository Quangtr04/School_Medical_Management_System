const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");

const adminUpdateUserById = async (req, res, next) => {
  const userId = req.params.user_id;
  const { email, phone, address, is_active, fullname } = req.body;
  const pool = await sqlServerPool;

  try {
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("fullname", sql.NVarChar, fullname)
      .input("email", sql.VarChar, email)
      .input("phone", sql.VarChar, phone)
      .input("address", sql.VarChar, address)
      .input("is_active", sql.Bit, is_active)
      .query(
        "UPDATE Users SET email = @email, phone = @phone, address = @address, is_active = @is_active, fullname = @fullname WHERE user_id = @userId"
      );

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: "User updated successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const parentUpdateUserById = async (req, res, next) => {
  const userId = req.user?.user_id;
  const { address, major, password } = req.body;

  const pool = await sqlServerPool;

  try {
    if (!address) {
      const oldAddress = await pool
        .request()
        .input("userId", sql.Int, userId)
        .query("SELECT address FROM Users WHERE user_id = @userId");
      address = oldAddress.recordset[0].address;
    }

    if (!major) {
      const oldMajor = await pool
        .request()
        .input("userId", sql.Int, userId)
        .query("SELECT major FROM Users WHERE user_id = @userId");
      major = oldMajor.recordset[0].major;
    }

    if (!password) {
      const oldPassword = await pool
        .request()
        .input("userId", sql.Int, userId)
        .query("SELECT password FROM Users WHERE user_id = @userId");
      password = oldPassword.recordset[0].password;
    }

    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("address", sql.NVarChar, address)
      .input("major", sql.NVarChar, major)
      .input("password", sql.NVarChar, password)
      .query("UPDATE Users SET address = @address, major = @major, password = @password WHERE user_id = @userId");

    if (result.rowsAffected[0] > 0) {
      await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("address", sql.NVarChar, address)
        .query("UPDATE Student_Information SET address = @address WHERE parent_id = @userId");
      res.status(200).json({ message: "User updated successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const nurseUpdateUserById = async (req, res, next) => {
  const userId = req.user?.user_id;
  const { address, password } = req.body;

  const pool = await sqlServerPool;

  try {
    if (!address) {
      const oldAddress = await pool
        .request()
        .input("userId", sql.Int, userId)
        .query("SELECT address FROM Users WHERE user_id = @userId");
      address = oldAddress.recordset[0].address;
    }

    if (!password) {
      const oldPassword = await pool
        .request()
        .input("userId", sql.Int, userId)
        .query("SELECT password FROM Users WHERE user_id = @userId");
      password = oldPassword.recordset[0].password;
    }

    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("address", sql.NVarChar, address)
      .input("password", sql.NVarChar, password)
      .query("UPDATE Users SET address = @address, password = @password WHERE user_id = @userId");

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: "User updated successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  adminUpdateUserById,
  parentUpdateUserById,
  nurseUpdateUserById,
};
