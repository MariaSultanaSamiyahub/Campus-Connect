const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePin
} = require('../Controllers/announcementController');

// Public routes
router.get('/', getAnnouncements);
router.get('/:id', getAnnouncement);

// Admin-only routes
router.post('/', protect, adminOnly, createAnnouncement);
router.put('/:id', protect, adminOnly, updateAnnouncement);
router.delete('/:id', protect, adminOnly, deleteAnnouncement);
router.patch('/:id/pin', protect, adminOnly, togglePin);

module.exports = router;

