const Joi = require("joi");

// Define the email regex: yxxxxxxxxx@kfupm.edu.sa
const emailRegex = /^[A-Za-z]\d{9}@kfupm\.edu\.sa$/;

// Sign-Up Validation Schema
const signUpSchema = Joi.object({
  name: Joi.string().required().label("Name"),
  email: Joi.string()
    .pattern(emailRegex)
    .required()
    .messages({
      "string.pattern.base":
        "Email must be in the format yxxxxxxxxx@kfupm.edu.sa",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    })
    .label("Email"),
  password: Joi.string().min(6).required().label("Password"),
  role: Joi.string()
    .valid("normal", "admin", "clubAccount")
    .required()
    .label("Role"),
});

// Log-In Validation Schema
const logInSchema = Joi.object({
  email: Joi.string()
    .pattern(emailRegex)
    .required()
    .messages({
      "string.pattern.base":
        "Email must be in the format xxxxxxxxx@kfupm.edu.sa",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    })
    .label("Email"),
  password: Joi.string().min(6).required().label("Password"),
});

// Profile Update Validation Schema
const profileUpdateSchema = Joi.object({
  name: Joi.string().required().label("Name"),
  profilePicture: Joi.string().optional(),
  interests: Joi.string().optional(),
  contactNumber: Joi.string().optional(),
  linkedIn: Joi.string().optional(),
  ID: Joi.string().optional(),
});

// Reservation Validation Schema
const reservationSchema = Joi.object({
  sport: Joi.string().required().messages({
    "string.empty": "Sport is required.",
    "any.required": "Sport is required.",
  }),
  field: Joi.string().required().messages({
    "string.empty": "Field is required.",
    "any.required": "Field is required.",
  }),
  type: Joi.string().valid("Public", "Private").required().messages({
    "any.only": "Type must be either 'Public' or 'Private'.",
    "string.empty": "Type is required.",
    "any.required": "Type is required.",
  }),
  date: Joi.date().iso().required().messages({
    "date.base": "Invalid date format. Please use YYYY-MM-DD.",
    "any.required": "Date is required.",
  }),
  time: Joi.string().required().messages({
    "string.empty": "Time is required.",
    "any.required": "Time is required.",
  }),
});

// Middleware to Validate Reservation Data
const validateReservation = (req, res, next) => {
  const { error } = reservationSchema.validate(req.body, { abortEarly: false });
  if (error) {
    console.error("Validation Errors:", error.details); // Log validation errors
    return res.status(400).json({
      errors: error.details.map((err) => ({
        message: err.message,
        field: err.context.key,
      })),
    });
  }
  next();
};

module.exports = {
  signUpSchema,
  logInSchema,
  profileUpdateSchema,
  validateReservation,
};
