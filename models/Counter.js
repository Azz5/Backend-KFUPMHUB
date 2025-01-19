// models/Counter.js
const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    count: { type: Number, required: true, default: 1000 } // Start at 1000
});

const Counter = mongoose.model("Counter", counterSchema);

module.exports = Counter;
