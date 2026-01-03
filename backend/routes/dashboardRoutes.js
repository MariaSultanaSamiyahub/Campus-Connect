const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const Marketplace = require('../models/marketplace');
const LostAndFound = require('../models/LostAndFound'); 
const Event = require('../models/Event');
const FlaggedContent = require('../models/FlaggedContent');
const User = require('../models/User');

// ✅ DASHBOARD - Get user statistics (finalized implementation)
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id; // Use MongoDB _id for queries
    const userCustomId = req.user.user_id; // Custom user_id for Notification model

    // Get user to check role and rating
    const user = await User.findById(userId);
    const isAdmin = user && user.role === 'admin';

    const [
      unreadCount, 
      activeListings, 
      lostCount, 
      foundCount, 
      upcomingEvents, 
      pendingFlags
    ] = await Promise.all([
      Notification.countDocuments({ user_id: userCustomId, is_read: false }),

      Marketplace.countDocuments({ seller_id: userId, status: 'available' }),

      LostAndFound.countDocuments({ posted_by: userId, type: 'lost', status: 'active' }),

      LostAndFound.countDocuments({ posted_by: userId, type: 'found', status: 'active' }),

      Event.countDocuments({ organizer: userId, status: 'upcoming' }),

      // Only count pending flags for admins
      isAdmin ? FlaggedContent.countDocuments({ status: 'pending' }) : Promise.resolve(0)
    ]);

    const stats = {
      activeListings,
      lostItems: lostCount,
      foundItems: foundCount,
      upcomingEvents,
      unreadNotifications: unreadCount,
      pendingFlags: isAdmin ? pendingFlags : 0,
      userRating: user ? (user.rating || 0) : 0
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

// ✅ DASHBOARD - Get recent activity (finalized implementation)
router.get('/recent-activity', protect, async (req, res) => {
  try {
    const userId = req.user._id; // Use MongoDB _id
    const userCustomId = req.user.user_id; // Custom user_id

    // Fetch recent activities from various sources
    const [recentListings, recentLostFound, recentEvents, recentNotifications] = await Promise.all([
      Marketplace.find({ seller_id: userId })
        .sort({ created_at: -1 })
        .limit(3)
        .select('title created_at')
        .lean(),
      
      LostAndFound.find({ posted_by: userId })
        .sort({ created_at: -1 })
        .limit(3)
        .select('title type created_at')
        .lean(),
      
      Event.find({ organizer: userId })
        .sort({ created_at: -1 })
        .limit(3)
        .select('title date created_at')
        .lean(),
      
      Notification.find({ user_id: userCustomId })
        .sort({ created_at: -1 })
        .limit(3)
        .select('title message created_at type')
        .lean()
    ]);

    // Combine and format activities
    const activities = [
      ...recentListings.map(item => ({
        title: `New Listing: ${item.title}`,
        description: 'You posted a new marketplace listing',
        timestamp: item.created_at,
        type: 'marketplace'
      })),
      ...recentLostFound.map(item => ({
        title: `${item.type === 'lost' ? 'Lost' : 'Found'}: ${item.title}`,
        description: `You posted a ${item.type} item`,
        timestamp: item.created_at,
        type: 'lostfound'
      })),
      ...recentEvents.map(item => ({
        title: `Event Created: ${item.title}`,
        description: `Event scheduled for ${new Date(item.date).toLocaleDateString()}`,
        timestamp: item.created_at,
        type: 'event'
      })),
      ...recentNotifications.map(item => ({
        title: item.title || 'New Notification',
        description: item.message,
        timestamp: item.created_at,
        type: item.type || 'notification'
      }))
    ];

    // Sort by timestamp and limit to 10 most recent
    const recentActivity = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    // If no activity, show welcome message
    if (recentActivity.length === 0) {
      recentActivity.push({
        title: 'Welcome to Campus Connect',
        description: 'Your dashboard is ready. Start by posting items, creating events, or browsing the marketplace.',
        timestamp: new Date(),
        type: 'system'
      });
    }

    res.json({ success: true, data: recentActivity });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity' });
  }
});

module.exports = router;