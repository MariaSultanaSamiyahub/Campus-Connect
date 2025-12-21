const express = require('express');
const router = express.Router();

const authenticateToken = (req, res, next) => {
  req.user = { id: req.headers['user-id'] || 'test-user' };
  next();
};

// Notification Model (create this file: backend/models/Notification.js)
// const mongoose = require('mongoose');
// const notificationSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   type: { type: String, enum: ['announcement', 'event', 'marketplace', 'lostfound', 'message', 'system'], required: true },
//   title: { type: String, required: true },
//   message: { type: String, required: true },
//   priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
//   is_read: { type: Boolean, default: false },
//   reference_type: String,
//   reference_id: String,
//   created_at: { type: Date, default: Date.now }
// });
// module.exports = mongoose.model('Notification', notificationSchema);

// GET /api/notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // const Notification = require('../models/Notification');
    // const notifications = await Notification.find({ user: userId })
    //   .sort({ created_at: -1 })
    //   .limit(50);

    // Mock data for now
    const notifications = [
      {
        _id: '1',
        type: 'marketplace',
        title: 'New buyer message',
        message: 'Someone is interested in your listing',
        priority: 'normal',
        is_read: false,
        created_at: new Date()
      }
    ];

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // const Notification = require('../models/Notification');
    // await Notification.findOneAndUpdate(
    //   { _id: id, user: userId },
    //   { is_read: true, read_at: new Date() }
    // );

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // const Notification = require('../models/Notification');
    // await Notification.updateMany(
    //   { user: userId, is_read: false },
    //   { is_read: true, read_at: new Date() }
    // );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
});

module.exports = router;
