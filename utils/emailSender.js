// utils/emailSender.js
const nodemailer = require("nodemailer");
const { SESClient, SendRawEmailCommand } = require('@aws-sdk/client-ses');

const ses = new SESClient({ region: 'eu-north-1' }); // Replace with your AWS region

// Configure Nodemailer to use the AWS SES client
const transporter = nodemailer.createTransport({
  SES: { ses, aws: require('@aws-sdk/client-ses') }
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: email,
  subject: "Your OTP Code",
  text: `Your OTP code is: ${otp}`,
};

try {
  await transporter.sendMail(mailOptions);
} catch (error) {
  console.error("Error sending email:", error);
}


module.exports = sendOTP;
