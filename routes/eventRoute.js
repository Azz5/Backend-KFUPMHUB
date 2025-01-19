const express = require('express');
const eventController = require('../Controllers/eventController.js'); // Adjust the path as necessary

const router = express.Router();

router.post('/', eventController.createEvent); // Create event
router.get('/', eventController.getAllEvents); // Get all events
router.get('/:id', eventController.getEventById); // Get event by ID
router.put('/:id', eventController.updateEvent); // Update event by ID
router.delete('/:id', eventController.deleteEvent); // Delete event by ID

module.exports = router;
