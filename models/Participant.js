const mongoose = require("mongoose");
const Reservation = require("./Reservation");

const participantSchema = new mongoose.Schema({
    reservationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation', // Reference to the Reservation model
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Validate email format
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// This will update the participant count in the reservation after a participant is added.
participantSchema.post('save', async function(doc) {
    const reservationId = doc.reservationId;

    try {
        // Get the updated participant count for the reservation
        const participantCount = await Participant.countDocuments({ reservationId });

        // Update the participants count in the reservation
        await Reservation.findByIdAndUpdate(reservationId, {
            participants: participantCount
        });
    } catch (err) {
        console.error("Error updating participants count:", err);
    }
});

const Participant = mongoose.model("Participant", participantSchema);

module.exports = Participant;
