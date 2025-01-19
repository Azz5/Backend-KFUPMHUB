const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Name of the club
    description: { type: String, required: true }, // Description of the club
    clubPicture: { type: String }, // Optional club logo or picture URL
    clubAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true  },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'/*, required: true */}, // User who created the club (usually admin)
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Members of the club
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }], // Events hosted by the club
    createdAt: { type: Date, default: Date.now }, // Date the club was created
    updatedAt: { type: Date, default: Date.now }, // Last updated time for the club
    isActive: { type: Boolean, default: true }, // Indicates if the club is active
});

module.exports = mongoose.model('Club', clubSchema);