// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const { Mongoose, mongo } = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["normal", "admin", "clubAccount"],
    default: "normal",
  },
  otpVerified: {
    type: Boolean,
    default: false,
  },
  profilePicture: { type: String, default: "" },
  interests: { type: String, default: "" },
  contactNumber: { type: String, default: "" },
  linkedIn: { type: String, default: "" },
  followedClubs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Club" }],
  enrolledClubs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Club" }],
  joinedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  joinedReservations: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" },
  ],
  createdReservations: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" },
  ], // Array to track multiple created reservations
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
};

const validate = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().label("Name"),
    email: Joi.string().email().required().label("Email"),
    password: passwordComplexity().required().label("Password"),
    role: Joi.string()
      .valid("normal", "admin", "clubAccount")
      .required()
      .label("Role"),
  });
  return schema.validate(data);
};

const validateProfileUpdate = (data) => {
  const schema = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    profilePicture: Joi.string().optional(),
    interests: Joi.string().optional(),
    contactNumber: Joi.string().optional(),
    linkedIn: Joi.string().optional(),
    ID: Joi.string().optional(),
  });
  return schema.validate(data);
};

const User = mongoose.model("User", userSchema);

module.exports = { User, validate, validateProfileUpdate };
