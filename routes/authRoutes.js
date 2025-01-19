// routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, validate} = require("../models/User");
const Joi = require("joi");
const router = express.Router();

// Regular expression to match the email format yxxxxxxxxx@kfupm.edu.sa
// const emailRegex = /^[a-zA-Z]\d{9}@kfupm\.edu\.sa$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@kfupm\.edu\.sa$/;

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).send({ message: "Access Denied. No token provided." });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send({ message: "Invalid token." });
    req.user = user;
    next();
  });
};

// Login route
router.post("/Log-In", async (req, res) => {
  try {
    // Validate email format using regex
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).send({ message: "Please enter a valid email in the format Name/ID@kfupm.edu.sa." });
    }

    // Validate login input (email and password only)
    const schema = Joi.object({
      email: Joi.string().email().required().label("Email"),
      password: Joi.string().required().label("Password"),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    // Find the user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).send({ message: "User not found, please sign up" });
    }

    // Check if the OTP is verified
    if (!user.otpVerified) {
      return res.status(403).send({ message: "Your account is not verified. Please verify your OTP." });
    }

    // Compare the password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).send({ message: "Invalid email or password" });
    }

    // Generate JWT token with an expiration time (1 hour)
    const token = jwt.sign(
      { _id: user._id, role: user.role }, // Include user role in the token payload
      process.env.JWT_SECRET, 
      { expiresIn: "3h" } // Set expiration time
    );
    // Return the token, role, and a success message
    res.status(200).send({
      data: {
        token,
        role: user.role, // Send the user's role back with the token
      },
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("Login error:", error); // Log the error to the console for debugging
    res.status(500).send({ message: "Server error" });
  }
});

// Verify token route
router.get("/verify-token", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password"); // Exclude password
    if (!user) return res.status(404).send({ message: "User not found." });

    res.status(200).send({ role: user.role });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).send({ message: "Server error." });
  }
});
module.exports = router;
