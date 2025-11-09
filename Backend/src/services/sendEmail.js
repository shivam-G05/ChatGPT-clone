// utils/sendEmail.js
const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html }) {
  // Use env variables for SMTP config
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true', // true for 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: `"Your App" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject,
    html
  });
}

module.exports = sendEmail;
