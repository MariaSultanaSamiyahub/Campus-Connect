const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// 1. Import Middleware & Models
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const FlaggedContent = require('../models/FlaggedContent');
const Marketplace = require('../models/marketplace');
const Event = require('../models/Event');
// const Announcement = require('../models/Announcement'); // Uncomment if you have this model

// 2. Admin Check Middleware
// Since 'role' isn't in your JWT, we fetch the user to check it
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying admin privileges' });
  }
};

// ==========================================
// ROUTES
// ==========================================

// GET /api/admin/flagged-content
// Fetch all flagged items with filters
router.get('/flagged-content', protect, requireAdmin, async (req, res) => {
  try {
    const { status = 'all', search = '' } = req.query;

    let query = {};
    
    // Filter by status
    if (status !== 'all') {
      query.status = status;
    }

    // Search by title or reason
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch and populate reporter details
    const flags = await FlaggedContent.find(query)
      .populate('reported_by', 'name email') // Get name/email of reporter
      .populate('reviewed_by', 'name')       // Get name of admin reviewer
      .sort({ created_at: -1 });

    res.json({ success: true, data: flags });
  } catch (error) {
    console.error('Flagged content error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch flagged content' });
  }
});

// PUT /api/admin/flagged-content/:id
// Update status (Approve, Dismiss, etc.)
router.put('/flagged-content/:id', protect, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; 
    // action can be: 'resolved', 'dismissed', 'under_review'

    let newStatus = 'pending';
    if (action === 'approved') newStatus = 'resolved'; // Keep content, clear flag
    if (action === 'removed') newStatus = 'resolved';  // Remove content, resolve flag
    if (action === 'dismissed') newStatus = 'dismissed'; // Ignore flag
    if (action === 'reviewing') newStatus = 'under_review';

    const updatedFlag = await FlaggedContent.findByIdAndUpdate(
      id,
      {
        status: newStatus,
        reviewed_by: req.user._id, // Set the current admin as reviewer
        action_taken: action,
        reviewed_at: new Date()
      },
      { new: true }
    );

    // OPTIONAL: If action is 'removed', you might want to automatically trigger the delete logic here too.
    // For now, we'll keep it separate or handle it in the frontend button logic.

    res.json({ success: true, message: 'Flag updated', data: updatedFlag });
  } catch (error) {
    console.error('Update flag error:', error);
    res.status(500).json({ success: false, message: 'Failed to update flag' });
  }
});

// DELETE /api/admin/content/:type/:id
// Remove the actual content (Listing, Event, etc.) from the database
router.delete('/content/:type/:id', protect, requireAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;

    let deletedItem = null;

    // Switch based on content type to delete from correct collection
    switch (type) {
      case 'listing':
      case 'marketplace':
        deletedItem = await Marketplace.findByIdAndDelete(id);
        break;
      case 'event':
        deletedItem = await Event.findByIdAndDelete(id);
        break;
      // case 'announcement':
      //   deletedItem = await Announcement.findByIdAndDelete(id);
      //   break;
      case 'user':
        // Be careful with banning users!
        // deletedItem = await User.findByIdAndUpdate(id, { is_active: false });
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid content type' });
    }

    if (!deletedItem) {
      return res.status(404).json({ success: false, message: 'Content not found or already deleted' });
    }

    // Also update any flags related to this content to 'resolved' (since content is gone)
    await FlaggedContent.updateMany(
      { content_id: id },
      { status: 'resolved', action_taken: 'removed', reviewed_by: req.user._id, reviewed_at: new Date() }
    );

    res.json({ success: true, message: 'Content removed successfully' });
  } catch (error) {
    console.error('Remove content error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove content' });
  }
});

// PUT /api/admin/users/:id/ban
// Ban or unban a user (admins cannot ban other admins)
router.put('/users/:id/ban', protect, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'ban' or 'unban'

    // Find the user to ban/unban
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admins from banning other admins
    if (targetUser.role === 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot ban other administrators' 
      });
    }

    // Update the ban status
    const isBanned = action === 'ban';
    targetUser.is_banned = isBanned;
    await targetUser.save();

    res.json({ 
      success: true, 
      message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
      data: {
        _id: targetUser._id,
        user_id: targetUser.user_id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        is_banned: targetUser.is_banned
      }
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user ban status' });
  }
});

module.exports = router;