const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


const sendForgotPasswordEmail = async (recipient, resetLink) => {
    await transporter.sendMail({
        to: recipient,
        subject: "Password Reset Request",
        html: `
            <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
            <p>This link expires in 15 minutes</p>
        `
    });
}

module.exports = sendForgotPasswordEmail;