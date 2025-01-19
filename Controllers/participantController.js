const Participant = require("../models/Participant");
const Reservation = require("../models/Reservation");

// Add a participant to a reservation
exports.addParticipant = async (req, res) => {
    const { reservationId, name, email } = req.body;

    try {
        // Check if the reservation exists
        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({ error: "Reservation not found" });
        }

        // Check if the participant already exists in the reservation
        const existingParticipant = await Participant.findOne({ reservationId, email });
        if (existingParticipant) {
            return res.status(400).json({ error: "Participant already exists" });
        }

        // Create a new participant
        const newParticipant = new Participant({
            reservationId,
            name,
            email
        });

        await newParticipant.save();

        // Update the participant count in the reservation
        const participantCount = await Participant.countDocuments({ reservationId });
        await Reservation.findByIdAndUpdate(reservationId, { participants: participantCount });

        res.status(201).json(newParticipant);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

// Remove a participant from a reservation
exports.removeParticipant = async (req, res) => {
    const { reservationId, participantId } = req.params;

    try {
        // Check if the participant exists
        const participant = await Participant.findById(participantId);
        if (!participant) {
            return res.status(404).json({ error: "Participant not found" });
        }

        // Remove the participant
        await Participant.findByIdAndDelete(participantId);

        // Update the participant count in the reservation
        const participantCount = await Participant.countDocuments({ reservationId });
        await Reservation.findByIdAndUpdate(reservationId, { participants: participantCount });

        res.status(200).json({ message: "Participant removed and reservation updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

// Get participants for a reservation
exports.getParticipants = async (req, res) => {
    const { reservationId } = req.params;

    try {
        const participants = await Participant.find({ reservationId });
        res.status(200).json(participants);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
