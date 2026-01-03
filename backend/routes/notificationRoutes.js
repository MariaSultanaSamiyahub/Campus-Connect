const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} = require('../Controllers/notificationController');

router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);

router.patch('/:id/read', markAsRead);
router.put('/:id/read', markAsRead);     // Bridge for dashboard

router.patch('/read-all', markAllAsRead);
router.put('/read-all', markAllAsRead);  // Bridge for dashboard

// DELETE route
router.delete('/:id', deleteNotification);

module.exports = router;