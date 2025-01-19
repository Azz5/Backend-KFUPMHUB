const express = require("express");
const {
  signUp,
  updateProfile,
  fetchProfile,
  adminRoute,
  clubRoute,
  followClub,
  unfollowClub,
  joinEvent,
  leaveEvent,
  getEnrolledClubs,
  getFollowedClubs,
  getJoinedEvents,
  fetchProfilebyId,
getUserWithReservations,
} = require("../Controllers/userController");
const authenticateToken = require("../middleware/authenticateToken");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

// Sign-Up route
router.post("/sign-Up", signUp);

router.get("/profile/reservations", authenticateToken, getUserWithReservations);
// Update Profile route
router.put("/profile", authenticateToken, updateProfile);

// Fetch Profile route
router.get("/profile", authenticateToken, fetchProfile);
router.post("/leave-event",authenticateToken,leaveEvent)
router.get("/profile/:id", fetchProfilebyId); //fetchProfilebyId

// Admin-only route
router.get("/admin-only", authenticateToken, authorizeRoles("admin"), adminRoute);

// Club-only route
router.get("/club-only", authenticateToken, authorizeRoles("clubAccount"), clubRoute);
router.post("/follow-club", authenticateToken, followClub);
router.post("/unfollow-club", authenticateToken, unfollowClub);
router.post("/join-event", authenticateToken, joinEvent);
router.get("/enrolled-clubs", authenticateToken, getEnrolledClubs);
router.get("/followed-clubs", authenticateToken, getFollowedClubs);
router.get("/joined-events", authenticateToken, getJoinedEvents);



module.exports = router;
