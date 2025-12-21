// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();

// Import your existing auth middleware
// const { authenticateToken } = require('../middleware/auth');

// Temporarily, if you don't have auth middleware yet:
const authenticateToken = (req, res, next) => {
  // For now, just pass through - replace with your actual auth
  req.user = { id: req.headers['user-id'] || 'test-user' };
  next();
};

// GET /api/dashboard/stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // You'll need to import your models
    // const Listing = require('../models/Listing');
    // const Event = require('../models/Event');
    // const Notification = require('../models/Notification');
    
    // For now, return mock data - replace with actual queries
    const stats = {
      activeListings: 0, // await Listing.countDocuments({ seller: userId, status: 'active' })
      lostItems: 0,
      foundItems: 0,
      upcomingEvents: 0,
      unreadNotifications: 0,
      pendingFlags: 0
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// GET /api/dashboard/recent-activity
router.get('/recent-activity', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch recent listings, events, etc.
    const recentActivity = [
      {
        title: 'New listing created',
        description: 'You created a new marketplace listing',
        timestamp: new Date(),
        type: 'listing'
      }
    ];

    res.json({ success: true, data: recentActivity });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity' });
  }
});

module.exports = router;


// ============================================
// backend/routes/notificationRoutes.js
// ============================================

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


// ============================================
// backend/routes/adminRoutes.js
// ============================================

const express = require('express');
const router = express.Router();

const authenticateToken = (req, res, next) => {
  req.user = { id: req.headers['user-id'] || 'test-user', role: 'admin' };
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// FlaggedContent Model (create this: backend/models/FlaggedContent.js)
// const mongoose = require('mongoose');
// const flaggedContentSchema = new mongoose.Schema({
//   content_type: { type: String, enum: ['listing', 'event', 'announcement', 'user', 'message'], required: true },
//   content_id: { type: String, required: true },
//   reported_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   reason: { type: String, enum: ['Spam', 'Inappropriate', 'Scam', 'Duplicate', 'Other'], required: true },
//   title: String,
//   status: { type: String, enum: ['pending', 'under_review', 'resolved', 'dismissed'], default: 'pending' },
//   reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   action_taken: String,
//   created_at: { type: Date, default: Date.now }
// });
// module.exports = mongoose.model('FlaggedContent', flaggedContentSchema);

// GET /api/admin/flagged-content
router.get('/flagged-content', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status = 'all', search = '' } = req.query;

    // const FlaggedContent = require('../models/FlaggedContent');
    // let query = {};
    // if (status !== 'all') query.status = status;
    // if (search) query.$or = [
    //   { title: { $regex: search, $options: 'i' } },
    //   { reason: { $regex: search, $options: 'i' } }
    // ];
    // const flags = await FlaggedContent.find(query)
    //   .populate('reported_by', 'name')
    //   .sort({ created_at: -1 });

    // Mock data
    const flags = [
      {
        _id: '1',
        content_type: 'listing',
        content_id: '123',
        reason: 'Spam',
        title: 'Suspicious listing',
        reported_by: 'John Doe',
        status: 'pending',
        created_at: new Date()
      }
    ];

    res.json({ success: true, data: flags });
  } catch (error) {
    console.error('Flagged content error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch flagged content' });
  }
});

// PUT /api/admin/flagged-content/:id
router.put('/flagged-content/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    // const FlaggedContent = require('../models/FlaggedContent');
    // await FlaggedContent.findByIdAndUpdate(id, {
    //   status: action === 'removed' ? 'resolved' : 'under_review',
    //   reviewed_by: req.user.id,
    //   action_taken: action,
    //   reviewed_at: new Date()
    // });

    res.json({ success: true, message: 'Flag updated successfully' });
  } catch (error) {
    console.error('Update flag error:', error);
    res.status(500).json({ success: false, message: 'Failed to update flag' });
  }
});

// DELETE /api/admin/content/:type/:id
router.delete('/content/:type/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;

    // Based on type, delete from appropriate model
    // if (type === 'listing') {
    //   const Listing = require('../models/Listing');
    //   await Listing.findByIdAndDelete(id);
    // }

    res.json({ success: true, message: 'Content removed successfully' });
  } catch (error) {
    console.error('Remove content error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove content' });
  }
});

module.exports = router;
