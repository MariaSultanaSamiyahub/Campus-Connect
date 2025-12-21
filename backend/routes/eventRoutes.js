const express = require('express');
const router = express.Router();
const {
  getEvents,
  createEvent,
  getEvent,
  rsvpEvent,
  cancelRSVP,
  getMyEvents,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth'); // ← CHANGED THIS LINE

// Public routes
router.get('/', getEvents);

// Protected route - IMPORTANT: /my-events must come BEFORE /:id
router.get('/my-events', protect, getMyEvents);

// Public route for single event (must come after /my-events)
router.get('/:id', getEvent);

// Protected routes
router.post('/', protect, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);
router.post('/:id/rsvp', protect, rsvpEvent);
router.delete('/:id/rsvp', protect, cancelRSVP);

module.exports = router;