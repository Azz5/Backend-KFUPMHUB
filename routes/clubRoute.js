const express = require('express');
const clubController = require('../Controllers/clubController'); // Adjust the path as necessary
const authenticateToken = require("../middleware/authenticateToken");
const authorizeRoles = require('../middleware/authorizeRoles');
const router = express.Router();

router.post('/', authenticateToken ,clubController.createClub); // Create a new club
router.get('/', clubController.getAllClubs); // Get all clubs
router.get('/:id', clubController.getClubById); // Get club by ID
router.put('/:id', clubController.updateClub); // Update club by ID
router.delete('/:id', clubController.deleteClub); // Delete club by ID

router.get('/:id/members', clubController.getClubMembers); // Get members of a specific club
router.get('/:id/activities', clubController.getClubActivities); // Get activities of a specific club
router.delete('/members', clubController.deleteClubMember)
router.post('/members',clubController.addMemberToClub)

module.exports = router;