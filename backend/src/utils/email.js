const nodemailer = require("nodemailer");

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

// Send password reset email
exports.sendPasswordResetEmail = async (email, resetUrl) => {
  const htmlContent = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Reset Password
    </a>
    <p>This link will expire in 30 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Password Reset Request - Study Room Booking",
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
};

// Send OTP email
exports.sendOTPEmail = async (email, otp) => {
  const htmlContent = `
    <h2>Two-Factor Authentication</h2>
    <p>Your OTP code is:</p>
    <h1 style="color: #007bff; font-size: 32px; letter-spacing: 2px;">${otp}</h1>
    <p>This code will expire in 5 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Your OTP Code - Study Room Booking",
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
exports.sendWelcomeEmail = async (email, name) => {
  const htmlContent = `
    <h2>Welcome to Study Room Booking System!</h2>
    <p>Hi ${name},</p>
    <p>Thank you for registering with us. You can now book study rooms at your convenience.</p>
    <p>Get started by logging in to your account.</p>
    <p>Best regards,<br/>Study Room Booking Team</p>
  `;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Welcome to Study Room Booking System",
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Welcome email sent" };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
};
