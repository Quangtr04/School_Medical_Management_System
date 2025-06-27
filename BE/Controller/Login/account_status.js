const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");

const SetStatusAccount = async (req, res, next) => {
    try {
        const { userId, is_active } = req.body;

        const pool = await sqlServerPool;
        const result = await pool.request()
            .input("userId", sql.Int, userId)
            .input("is_active", sql.VarChar, is_active)
            .query
            ("UPDATE Users SET is_active = @is_active WHERE user_id = @userId");

        // Check if the update was successful
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "Account status updated successfully" });
    } catch (error) {
        console.error("Error updating account status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

  const deleteAccountById = async (req, res, next) => {
    const userId = req.params.userId;
    const pool = await sqlServerPool;

    try {
        const result = await pool.request()
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
    const { email, phone, address, major } = req.body;
    const pool = await sqlServerPool;

    try {
        const result = await pool.request()
            .input("userId", sql.Int, userId)
            .input("email", sql.VarChar, email)
            .input("phone", sql.VarChar, phone)
            .input("address", sql.VarChar, address)
            .input("major", sql.VarChar, major)
            .query("UPDATE Users SET email = @email, phone = @phone, address = @address, major = @major WHERE user_id = @userId");

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
    const userId = req.params.userId;
    const { address, major } = req.body;
    const pool = await sqlServerPool;

    try {
        const result = await pool.request()
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
    SetStatusAccount,
    deleteAccountById,
    adminUpdateUserById,
    parentUpdateUserById
};
