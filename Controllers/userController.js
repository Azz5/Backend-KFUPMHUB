const bcrypt = require("bcryptjs");
const { User, validate } = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Sign-Up controller
const signUp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;


    let verified = false;
    // Validate the user data
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    // Check email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@kfupm\.edu\.sa$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({
        message:
          "Please enter a valid email in the format Name/ID@kfupm.edu.sa.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .send({ message: "User with this email already exists" });
    }

    // Hash password and create user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    if (role === "clubAccount") {
      verified = true;
    }
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      otpVerified: verified
    });

    await user.save();


    // Now, no OTP is generated here. Just inform user to request OTP separately.
    res.status(201).send({
      message:
        "User registered successfully! Please request an OTP to verify your email.",Account: user
    });
  } catch (error) {
    console.error("Sign-up error:", error);
    res.status(500).send({ message: "Server error" });
  }
};
const OTPUser = (user) => {
  user.otpVerified = true;
}
// Update Profile controller
const updateProfile = async (req, res) => {
  const userId = req.user._id; // Extract user ID from the JWT token

  const { name, profilePicture, interests, contactNumber, linkedIn, ID } =
    req.body;

  // Ensure the name is provided
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    // Find the user by ID and update their profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided, otherwise keep old values
    user.name = name || user.name;
    user.profilePicture = profilePicture || user.profilePicture;
    user.interests = interests || user.interests;
    user.contactNumber = contactNumber || user.contactNumber;
    user.linkedIn = linkedIn || user.linkedIn;
    user.ID = ID || user.ID;

    // Save updated user data
    await user.save();

    // Respond with updated data
    res.status(200).json({
      message: "Profile updated successfully",
      data: {
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        interests: user.interests,
        contactNumber: user.contactNumber,
        linkedIn: user.linkedIn,
        ID: user.ID,
      },
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res
      .status(500)
      .json({ message: "Failed to update profile", error: err.message });
  }
};

// Fetch Profile controller
const fetchProfilebyId = async (req, res) => {
  try {
    const userId = req.param.id; // Extract user ID from the token

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send back the user data (excluding sensitive information like password)
    res.status(200).json({
      message: "User profile fetched successfully",
      data: {
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        interests: user.interests,
        contactNumber: user.contactNumber,
        linkedIn: user.linkedIn,
        ID: user.ID,
      },
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch profile", error: err.message });
  }
};

const fetchProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Extract user ID from the token

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send back the user data (excluding sensitive information like password)
    res.status(200).json({
      message: "User profile fetched successfully",
      data: {
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        interests: user.interests,
        contactNumber: user.contactNumber,
        linkedIn: user.linkedIn,
        ID: user.ID,
        _id: req.user._id,
      },
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch profile", error: err.message });
  }
};

// Admin route example controller
const adminRoute = async (req, res) => {
  res.status(200).send({ message: "Welcome Admin!" });
};

// Club Account route example controller
const clubRoute = async (req, res) => {
  res.status(200).send({ message: "Welcome Club Account!" });
};

const followClub = async (req, res) => {
  const userId = req.user._id;
  const { clubId } = req.body; // Get the clubId from the request body

  if (!mongoose.Types.ObjectId.isValid(clubId)) {
    return res.status(400).json({ message: "Invalid club ID" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.followedClubs.includes(clubId)) {
      return res.status(400).json({ message: "Already following this club" });
    }

    user.followedClubs.push(clubId); // Add the club to followedClubs
    await user.save();

    res.status(200).json({
      message: "Club followed successfully",
      data: user.followedClubs,
    });
  } catch (error) {
    console.error("Error following club:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove Club from followedClubs
const unfollowClub = async (req, res) => {
  const userId = req.user._id;
  const { clubId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(clubId)) {
    return res.status(400).json({ message: "Invalid club ID" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.followedClubs.indexOf(clubId);
    if (index === -1) {
      return res
        .status(400)
        .json({ message: "Club not found in followed clubs" });
    }

    user.followedClubs.splice(index, 1); // Remove the club from followedClubs
    await user.save();

    res.status(200).json({
      message: "Club unfollowed successfully",
      data: user.followedClubs,
    });
  } catch (error) {
    console.error("Error unfollowing club:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getEnrolledClubs = async (req, res) => {
  const userId = req.user._id; // Get the userId from the authenticated token

  try {
    const user = await User.findById(userId).populate("enrolledClubs");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the enrolled clubs (excluding sensitive user information)
    res.status(200).json({
      message: "Fetched enrolled clubs successfully",
      data: user.enrolledClubs,
    });
  } catch (error) {
    console.error("Error fetching enrolled clubs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add Event to joinedEvents
const joinEvent = async (req, res) => {
  const userId = req.user._id;
  const { eventId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: "Invalid event ID" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.joinedEvents.includes(eventId)) {
      return res.status(400).json({ message: "Already joined this event" });
    }

    user.joinedEvents.push(eventId); // Add the event to joinedEvents
    await user.save();

    res
      .status(200)
      .json({ message: "Event joined successfully", data: user.joinedEvents });
  } catch (error) {
    console.error("Error joining event:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove Event from joinedEvents
const leaveEvent = async (req, res) => {
  const userId = req.user._id;
  const { eventId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: "Invalid event ID" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.joinedEvents.indexOf(eventId);
    if (index === -1) {
      return res
        .status(400)
        .json({ message: "Event not found in joined events" });
    }

    user.joinedEvents.splice(index, 1); // Remove the event from joinedEvents
    await user.save();

    res
      .status(200)
      .json({ message: "Event left successfully", data: user.joinedEvents });
  } catch (error) {
    console.error("Error leaving event:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Followed Clubs
const getFollowedClubs = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate("followedClubs");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Fetched followed clubs successfully",
      data: user.followedClubs,
    });
  } catch (error) {
    console.error("Error fetching followed clubs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Joined Events
const getJoinedEvents = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate("joinedEvents");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Fetched joined events successfully",
      data: user.joinedEvents,
    });
  } catch (error) {
    console.error("Error fetching joined events:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getUserWithReservations = async (req, res) => {

  const userId = req.user._id;
  try {
    // Extract user ID from `req.user` (assumes user is authenticated)

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }


    // Fetch the user with populated reservations
    const user = await User.findById(userId)
        .populate("createdReservations")
        .populate("joinedReservations");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }


    // Respond with the user's reservation data
    res.status(200).json({
      message: "User reservations fetched successfully.",
      data: {
        createdReservations: user.createdReservations,
        joinedReservations: user.joinedReservations,
      },
    });
  } catch (err) {
    console.error("Error fetching user reservations:", err);
    res.status(500).json({ error: "Failed to fetch user reservations." });
  }
};


module.exports = {
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
  getJoinedEvents,
  getFollowedClubs,
  fetchProfilebyId,
  getUserWithReservations,
  OTPUser
};
