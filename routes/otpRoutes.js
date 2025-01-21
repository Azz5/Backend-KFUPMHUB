const express = require('express');
const nodemailer = require('nodemailer');
const generateOTP = require('../utils/otpGenerator');
const OTP = require('../models/OTP');
const { User } = require('../models/User');
const router = express.Router();

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // If you are using Gmail. For other services, adjust accordingly.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper function to send OTP emails
async function sendOTPEmail(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
}

// POST /request-otp
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
