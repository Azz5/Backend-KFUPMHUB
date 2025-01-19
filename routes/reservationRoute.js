const express = require("express");
const router = express.Router();
const reservationController = require("../Controllers/reservationController");
const { validateReservation } = require("../validationSchemas");
const authenticateToken = require("../middleware/authenticateToken");



// Route to create a reservation
router.post(
  "/",
  authenticateToken,
  validateReservation,
  reservationController.createReservation
);

// Get available time slots
router.get("/available-timeslots", reservationController.getAvailableTimeSlots);

// Join a reservation
router.post(
  "/:id/join",
  authenticateToken,
  reservationController.joinReservation
);

// Leave a reservation
router.post(
  "/:id/leave",
  authenticateToken,
  reservationController.leaveReservation
);

// Delete a reservation
router.delete(
  "/:id",
  authenticateToken,
  reservationController.deleteReservation
);

// Get reservations with filters
router.get("/", reservationController.getReservationsWithFilters);

// Get reservation by ID
router.get("/:id", reservationController.getReservationById);

router.get("/code/:code", reservationController.getReservationByCode);

module.exports = router;
