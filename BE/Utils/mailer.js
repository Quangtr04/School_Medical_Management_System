const nodemailer = require('nodemailer');
require('dotenv').config();
// Tạo transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,

  }
});

const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: '"PIEDTEAM 👨‍⚕️"',
      to,
      subject,
      text,
    });

    console.log('✅ Email sent:', info.response);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

module.exports = sendEmail;