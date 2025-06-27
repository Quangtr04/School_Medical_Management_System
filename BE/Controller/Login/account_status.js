const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");

const deleteAccountById = async (req, res, next) => {
  const userId = req.params;
  const pool = await sqlServerPool;

  try {
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("DELETE FROM Users WHERE user_id = @userId");

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: "Account deleted successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const adminUpdateUserById = async (req, res, next) => {
  const userId = req.params.userId;
  const { email, phone, address, major, is_active } = req.body;
  const pool = await sqlServerPool;

  try {
    if (is_active) {
      const result = await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("email", sql.VarChar, email)
        .input("phone", sql.VarChar, phone)
        .input("address", sql.VarChar, address)
        .input("major", sql.VarChar, major)
        .input("is_active", sql.Bit, is_active)
        .query(
          "UPDATE Users SET email = @email, phone = @phone, address = @address, major = @major, is_active = @is_active WHERE user_id = @userId"
        );

      if (result.rowsAffected[0] > 0) {
        res.status(200).json({ message: "User updated successfully" });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } else {
      const result = await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("email", sql.VarChar, email)
        .input("phone", sql.VarChar, phone)
        .input("address", sql.VarChar, address)
        .input("major", sql.VarChar, major)
        .query(
          "UPDATE Users SET email = @email, phone = @phone, address = @address, major = @major WHERE user_id = @userId"
        );

      if (result.rowsAffected[0] > 0) {
        res.status(200).json({ message: "User updated successfully" });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const parentUpdateUserById = async (req, res, next) => {
  const userId = req.user?.user_id;
  const { address, major } = req.body;
  const pool = await sqlServerPool;

  try {
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("address", sql.VarChar, address)
      .input("major", sql.VarChar, major)
      .query("UPDATE Users SET address = @address, major = @major WHERE user_id = @userId");

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
  deleteAccountById,
  adminUpdateUserById,
  parentUpdateUserById,
};
