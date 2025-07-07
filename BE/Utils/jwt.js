const jwt = require("jsonwebtoken");
require('dotenv').config()

const generateToken = (user) => {
  return jwt.sign(
    {
      user_id: user.user_id,
      role: user.role, // thêm gì tùy bạn
    },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "1h" }
  );
};

module.exports = generateToken;
