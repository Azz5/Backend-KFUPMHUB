const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // The email of the owner/creator
  sport: {
    type: String,
    required: true,
    enum: [
      "Football",
      "Volleyball",
      "Basketball",
      "Tennis",
      "Badminton",
      "Squash",
    ],
  },
  field: { type: String, required: true }, // e.g. "Field 1", "Court 2"
  code: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^\d{4}$/.test(v); // Exactly 4-digit code
      },
      message: (props) => `${props.value} is not a valid 4-digit code!`,
    },
  },
  type: { type: String, required: true, enum: ["Private", "Public"] },
  participants: {
    type: Number,
    required: true,
    default: 1, // The owner counts as a participant
  },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // e.g. "15:00" or "10:00 - 11:00"
  timestamp: { type: Date, default: Date.now },
});

const Reservation = mongoose.model("Reservation", reservationSchema);
module.exports = Reservation;
