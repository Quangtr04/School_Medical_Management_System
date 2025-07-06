// testEmail.js
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('📧', process.env.GMAIL_USER);
console.log('🔑', process.env.GMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Lỗi xác thực:', error);
  } else {
    console.log('✅ Kết nối thành công');
  }
});
