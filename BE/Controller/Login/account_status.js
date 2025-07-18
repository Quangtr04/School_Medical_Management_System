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
  const userId = req.params.user_id;
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
    // Validate that required fields are present
    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    // Update user information
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("address", sql.NVarChar, address)
      .input("major", sql.NVarChar, major || "")
      .query("UPDATE Users SET address = @address, major = @major WHERE user_id = @userId");

    if (result.rowsAffected[0] > 0) {
      // Also update student information address if this user is a parent
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
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

module.exports = {
  deleteAccountById,
  adminUpdateUserById,
  parentUpdateUserById,
};
