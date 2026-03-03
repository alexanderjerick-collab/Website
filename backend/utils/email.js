const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
  const mailOptions = {
    from: '"Jerick TM" <noreply@jericktm.com>',
    to: email,
    subject: 'Password Reset - Jerick TM',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #000;">Password Reset Request</h2>
        <p>You requested a password reset for your Jerick TM account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px;">Reset Password</a>
        <p style="margin-top: 20px; color: #666;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    return false;
  }
};

module.exports = { sendPasswordResetEmail };
