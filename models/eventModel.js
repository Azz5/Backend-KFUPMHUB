const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Title of the event
    subTitle: { type: String, required: true },
    description: { type: String, required: true }, // Description of the event
    location: { type: String }, // Event location (optional)
    img: { type: String },
    date: { type: Date, required: true }, // Event date and time
    createdByClub: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true }, // User who created the event //May use Or not//
    //attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who are attending the event //May use Or not//
    createdAt: { type: Date, default: Date.now }, // Date the event was created
    updatedAt: { type: Date, default: Date.now }, // Last updated time for the event
    isActive: { type: Boolean, default: true }, // Indicates if the event is active or canceled
});

module.exports = mongoose.model('Event', eventSchema);
