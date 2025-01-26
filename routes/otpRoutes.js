const express = require('express');
const nodemailer = require('nodemailer');
const generateOTP = require('../utils/otpGenerator');
const OTP = require('../models/OTP');
const { User } = require('../models/User');
const router = express.Router();
const cors = require('cors');
// Configure CORS middleware
const corsOptions = {
  origin: 'https://kfupmhub.xyz',
  methods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 465,
  secure: true, // Use TLS
  auth: {

    user: "resend", // Special Resend username
    pass: process.env.EMAIL_PASSWORD// Your Resend API key

  }
});// Helper function to send OTP emails
async function sendOTPEmail(email, otp) {
  const mailOptions = {

    from: 'KFUPM OTP <KFUPMHUB@otp.kfupmhub.xyz>', // Your verified domain
    to: email,
    subject: 'Your KFUPM Verification Code',
    html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2d3748;">KFUPM Account Verification</h2>
            <p>Your one-time verification code:</p>

            <div style="font-size: 24px; font-weight: bold; color: #3182ce; margin: 15px 0;">
              ${otp}
            </div>
            <p style="color: #718096;">This code expires in 5 minutes</p>
            <hr style="border-color: #e2e8f0;">
            <p style="font-size: 12px; color: #718096;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>`

  };


  try {

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Resend Error:", error.response?.body || error);
    throw error;
  }
}// POST /request-otp
router.post('/request-otp', async (req, res) => {
  const { email } = req.body;

  // Delete old OTP entries for this email
  await OTP.deleteMany({ email });

  // Generate a new OTP
  const otp = generateOTP();

  // Set expiration time (5 minutes)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5);

  try {
    const otpRecord = new OTP({ email, otp, expiresAt });
    await otpRecord.save();


    // Send the OTP via email
    await sendOTPEmail(email, otp);

    res.status(200).send({ message: `OTP sent to ${email}` });
  } catch (error) {
    console.error("Error saving OTP:", error);
    res.status(500).send({ message: "Error generating OTP" });
  }
});

// POST /verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Get the most recent OTP record for this email
    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).send({ message: "No OTP record found for this email." });
    }


    const currentTime = new Date();
    if (currentTime > otpRecord.expiresAt) {
      return res.status(400).send({ message: "OTP has expired. Please request a new one." });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).send({ message: "Invalid OTP. Please check and try again." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: "User not found." });
    }

    user.otpVerified = true;
    await user.save();

    // Delete the OTP after successful verification
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).send({ message: "OTP verified successfully. You can now log in." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).send({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
