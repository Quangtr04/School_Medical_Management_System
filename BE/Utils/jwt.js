const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (user) => {
  return jwt.sign(
    // dùng thuật toán HMAC SHA256 mặc định
    // header được mặc đinh là {
    //   "alg": "HS256",
    //   "typ": "JWT"
    // }
    {
      user_id: user.user_id,
      role: user.role,
    }, //payload
    process.env.JWT_SECRET || "your-secret-key", //Ghép lại thành chuỗi: header.payload.signature
    { expiresIn: "1h" }
  );
};

module.exports = generateToken;
