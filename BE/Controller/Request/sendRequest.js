const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const sendNotification = require("../../Utils/sendNotification");

const sendRequest = async (req, res, next) => {
  try {
    const {
      full_name,
      email,
      phone,
      req_type,
      title,
      text,
      target_role_id
    } = req.body;

    // 1. Kiểm tra đầu vào
    if (!full_name || !email || !phone || !req_type || !title || !text || !target_role_id) {
      return res.status(400).json({
        status: "fail",
        message: "Vui lòng nhập đầy đủ các trường thông tin.",
      });
    }

    const pool = await sqlServerPool;

    // 2. Xác thực người dùng
    const userCheck = await pool
      .request()
      .input("full_name", sql.NVarChar, full_name)
      .query(`
        SELECT TOP 1 email, phone
        FROM Users
        WHERE LOWER(fullname) = LOWER(@full_name)
      `);

    const user = userCheck.recordset[0];

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "Không tìm thấy người dùng theo họ tên.",
      });
    }

    const emailMatch = user.email.toLowerCase() === email.toLowerCase();
    const phoneMatch = user.phone === phone;

    if (!emailMatch || !phoneMatch) {
      return res.status(400).json({
        status: "fail",
        message: "Email hoặc số điện thoại không khớp với họ tên đã nhập.",
      });
    }

    // 3. Lưu yêu cầu vào bảng UserRequest
    await pool
      .request()
      .input("fullname", sql.NVarChar, full_name)
      .input("email", sql.VarChar, email)
      .input("phone", sql.VarChar, phone)
      .input("title", sql.NVarChar, title)
      .input("req_type", sql.VarChar, req_type)
      .input("text", sql.NVarChar, text)
      .input("status", sql.VarChar, "ĐANG XỬ LÝ")
      .input("target_role_id", sql.Int, target_role_id)
      .query(`
        INSERT INTO UserRequest (fullname, email, phone, title, req_type, text, status, target_role_id)
        VALUES (@fullname, @email, @phone, @title, @req_type, @text, @status, @target_role_id)
      `);

    // 4. Gửi thông báo đến tất cả người dùng thuộc role tương ứng
    const result = await pool
      .request()
      .input("role_id", sql.Int, target_role_id)
      .query("SELECT user_id FROM Users WHERE role_id = @role_id");

    for (const { user_id } of result.recordset) {
      await sendNotification(
        pool,
        user_id,
        `Yêu cầu mới: ${title}`,
        `
Yêu cầu từ ${full_name}:
- Loại: ${req_type}
- Tiêu đề: ${title}
- Nội dung: ${text}
        `.trim()
      );
    }

    // 5. Trả phản hồi thành công
    res.status(200).json({
      status: "success",
      message: "Yêu cầu đã được gửi và thông báo đã được gửi đến đúng vai trò.",
    });

  } catch (error) {
    console.error("❌ Lỗi xử lý yêu cầu:", error);
    res.status(500).json({
      status: "error",
      message: "Đã xảy ra lỗi máy chủ khi xử lý yêu cầu.",
    });
  }
};

module.exports = {
  sendRequest
};
