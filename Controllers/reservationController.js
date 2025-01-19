const Reservation = require("../models/Reservation");
const generateCode = () => Math.floor(1000 + Math.random() * 9000).toString();

exports.createReservation = async (req, res) => {
  const { sport, field, type, date, time } = req.body;
  const userId = req.user._id;

  try {
    if (!sport || !field || !type || !date || !time) {
      return res.status(400).json({
        error:
          "Missing required fields. Please ensure all fields are provided.",
      });
    }

    const existingReservation = await Reservation.findOne({
      sport,
      field,
      date: new Date(date),
      time,
    });

    if (existingReservation) {
      return res.status(400).json({
        error: "The field is already reserved for this time slot.",
      });
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Calculate expiry timestamp (7 hours from now)
    // const expiryTimestamp = new Date(Date.now() + 30 * 1000);

    const newReservation = new Reservation({
      createdBy: userId,
      sport,
      field,
      code,
      type,
      participants: 1,
      date: new Date(date),
      time,
    });

    await newReservation.save();
    res.status(201).json(newReservation);
  } catch (err) {
    console.error("Error creating reservation:", err);
    res.status(500).json({ error: "Server error creating reservation." });
  }
};

const sportCapacities = {
  Football: 16,
  Volleyball: 12,
  Basketball: 10,
  Tennis: 4,
  Badminton: 4,
  Squash: 2,
};

exports.getReservationById = async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    // Get the capacity for the sport
    const sportCapacity = sportCapacities[reservation.sport] || 0;

    // Calculate 50% of the capacity
    const neededToConfirm = Math.ceil(sportCapacity / 2);

    // Calculate how many more students are needed
    const studentsNeeded = Math.max(
      neededToConfirm - reservation.participants,
      0
    );

    // Include studentsNeeded in the response
    res.status(200).json({
      ...reservation._doc, // Include all existing fields
      studentsNeeded,
    });
  } catch (err) {
    console.error("Error fetching reservation:", err);
    res.status(500).json({ error: "Server error fetching reservation" });
  }
};

// Update a reservation
exports.updateReservation = async (req, res) => {
  const { id } = req.params;
  const { email, sport, field, type, date, time, participants } = req.body;

  try {
    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      { email, sport, field, type, date: new Date(date), time, participants },
      { new: true }
    );

    if (!updatedReservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    res.status(200).json(updatedReservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error updating reservation" });
  }
};

// Delete a reservation
exports.deleteReservation = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedReservation = await Reservation.findByIdAndDelete(id);
    if (!deletedReservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    await Participant.deleteMany({ reservationId: id });

    res
      .status(200)
      .json({ message: "Reservation and its participants deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error deleting reservation" });
  }
};

// Fetch available time slots
exports.getAvailableTimeSlots = async (req, res) => {
  const { sport, field, date } = req.query;

  try {
    const formattedDate = new Date(date);
    const reservations = await Reservation.find({
      sport,
      field,
      date: formattedDate,
    });
    const reservedTimes = reservations.map((r) => r.time);

    // Define your default timeslots
    const allTimeSlots = [
      "10:00 - 11:00",
      "11:00 - 12:00",
      "15:00 - 16:00",
      "16:00 - 17:00",
    ];
    const availableTimeSlots = allTimeSlots.filter(
      (slot) => !reservedTimes.includes(slot)
    );

    res.status(200).json({ availableTimeSlots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching time slots" });
  }
};

// Filter reservations
exports.getReservationsWithFilters = async (req, res) => {
  const { sport } = req.query;
  const filters = {};

  if (sport) filters.sport = sport;

  try {
    const reservations = await Reservation.find(filters);
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ error: "Failed to fetch reservations." });
  }
};

// Join a reservation
exports.joinReservation = async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findById(id);
    if (!reservation)
      return res.status(404).json({ error: "Reservation not found" });

    // Increase participants by 1 (or handle max)
    // If you want to ensure no duplicates, you'd check if user already joined
    const maxCapacity = sportCapacities[reservation.sport];
    if (reservation.participants >= maxCapacity) {
      return res
        .status(400)
        .json({ error: "Reservation has reached its capacity" });
    }
    reservation.participants += 1;
    await reservation.save();
    res.status(200).json({ message: "Joined successfully", reservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error joining reservation" });
  }
};

exports.leaveReservation = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  try {
    const reservation = await Reservation.findById(id);
    if (!reservation)
      return res.status(404).json({ error: "Reservation not found" });

    // Update participants count (e.g., decrease by 1)
    if (reservation.participants > 0) {
      reservation.participants -= 1;
      await reservation.save();
      return res
        .status(200)
        .json({ message: "Left the reservation successfully", reservation });
    } else {
      return res
        .status(400)
        .json({ error: "No participants to leave the reservation." });
    }
  } catch (err) {
    console.error("Error leaving reservation:", err);
    res.status(500).json({ error: "Server error while leaving reservation" });
  }
};
exports.getReservationByCode = async (req, res) => {
  const { code } = req.params; // Extract the reservation code from the route params

  try {
    // Find the reservation with the given code
    const reservation = await Reservation.findOne({ code });
    console.log(reservation);
    if (!reservation) {
      // If no reservation is found, return a 404 response
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Return the reservation details
    res.status(200).json(reservation);
  } catch (error) {
    console.error("Error fetching reservation by code:", error);
    res.status(500).json({ message: "Server error fetching reservation" });
  }
};
