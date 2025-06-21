const sqlServerPool = require("../../Utils/connectMySql");
const sql = require("mssql");

const getNotifications = async (req, res) => {
  const user_id = req.user?.user_id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const pool = await sqlServerPool;

    // Tổng số thông báo
    const totalQuery = await pool
      .request()
      .input("receiver_id", sql.Int, user_id)
      .query(`SELECT COUNT(*) AS total FROM Notification WHERE receiver_id = @receiver_id`);

    const total = totalQuery.recordset[0].total;
    const totalPages = Math.ceil(total / limit);

    // Lấy thông báo theo phân trang
    const notificationsQuery = await pool
      .request()
      .input("receiver_id", sql.Int, user_id)
      .input("offset", sql.Int, offset)
      .input("limit", sql.Int, limit).query(`
        SELECT notification_id, title, message, created_at
        FROM Notification
        WHERE receiver_id = @receiver_id
        ORDER BY created_at DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    res.status(200).json({
      currentPage: page,
      totalPages,
      totalItems: total,
      items: notificationsQuery.recordset,
    });
  } catch (error) {
    console.error("getNotifications error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getNotifications };
