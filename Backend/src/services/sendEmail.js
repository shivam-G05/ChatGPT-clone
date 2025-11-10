// utils/sendEmail.js
const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html }) {
  // Use env variables for SMTP config
  const transporter = nodemailer.createTransport({
  host: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  

});
transporter.verify(function(error, success) {
    if (error) {
        console.log("Email server error:", error);
    } else {
        console.log("Email server connected successfully");
    }
});



  await transporter.sendMail({
    from: `"ChatGpt Clone" <${process.env.EMAIL_USER}>`,
    to:email,
    subject:"Reset Password Link",
    html:`<p>Click here: <a href="${resetUrl}">Reset Password</a></p>`
  });
}

module.exports = sendEmail;
