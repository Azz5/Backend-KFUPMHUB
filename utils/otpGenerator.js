// utils/otpGenerator.js
function generateOTP() {
    // Generate a 6-digit OTP and convert it to a string
    const otpNum = Math.floor(100000 + Math.random() * 900000);
    return otpNum.toString();
  }
  
  module.exports = generateOTP;
  