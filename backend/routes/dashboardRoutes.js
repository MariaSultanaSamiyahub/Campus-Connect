const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const Marketplace = require('../models/marketplace');
const LostAndFound = require('../models/LostAndFound'); 
const Event = require('../models/Event');
const FlaggedContent = require('../models/FlaggedContent');

router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.user_id; 

    const [
      unreadCount, 
      activeListings, 
      lostCount, 
      foundCount, 
      upcomingEvents, 
      pendingFlags
    ] = await Promise.all([
      Notification.countDocuments({ user_id: userId, is_read: false }),

      Marketplace.countDocuments({ seller_id: userId, status: 'available' }),

      LostAndFound.countDocuments({ posted_by: userId, type: 'lost', status: 'active' }),

      LostAndFound.countDocuments({ posted_by: userId, type: 'found', status: 'active' }),

      Event.countDocuments({ organizer_id: userId, status: 'upcoming' }),

      FlaggedContent.countDocuments({ status: 'pending' })
    ]);

    const stats = {
      activeListings,
      lostItems: lostCount,
      foundItems: foundCount,
      upcomingEvents,
      unreadNotifications: unreadCount,
      pendingFlags
    };

    res.json({ success: true, data: stats });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    
    res.json({ 
      success: true, 
      data: { 
        activeListings: 0, 
        lostItems: 0, 
        foundItems: 0, 
        upcomingEvents: 0, 
        unreadNotifications: 0, 
        pendingFlags: 0 
      },
      message: 'Error fetching some stats'
    });
  }
});

router.get('/recent-activity', protect, async (req, res) => {
  try {
    const userId = req.user.user_id;


    const recentActivity = [
      {
        title: 'Welcome to Campus Connect',
        description: 'Your dashboard is ready.',
        timestamp: new Date(),
        type: 'system'
      }
    ];

    res.json({ success: true, data: recentActivity });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity' });
  }
});

module.exports = router;