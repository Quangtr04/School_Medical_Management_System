async function sendNotification(pool, receiver_id, title, message) {
  return await pool
    .request()
    .input("title", sql.NVarChar, title)
    .input("message", sql.NVarChar, message)
    .input("receiver_id", sql.Int, receiver_id).query(`
      INSERT INTO Notification (title, message, receiver_id)
      VALUES (@title, @message, @receiver_id)
    `);
}

module.exports = sendNotification;
