// backend/routes/lostAndFoundRoutes.js
const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Import your auth middleware (adjust path as needed)
const { protect } = require('../middleware/auth');

// Import Lost and Found model
const LostAndFound = require('../models/LostAndFound');

// @route   GET /api/lost-and-found
// @desc    Get all lost and found items with filters
// @access  Public
router.get('/', [
  query('type').optional().isIn(['lost', 'found']),
  query('category').optional().isString(),
  query('search').optional().isString(),
  query('status').optional().isIn(['active', 'claimed', 'expired'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, category, search, status = 'active' } = req.query;
    
    // Build query
    let query = { status };
    
    if (type) {
      query.type = type;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await LostAndFound.find(query)
      .populate('posted_by', 'name email')
      .sort({ created_at: -1 })
      .limit(50);

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error fetching lost and found items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   GET /api/lost-and-found/:id
// @desc    Get single lost and found item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await LostAndFound.findById(req.params.id)
      .populate('posted_by', 'name email rating')
      .populate('claimed_by', 'name email');

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    // Increment view count
    item.views = (item.views || 0) + 1;
    await item.save();

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   POST /api/lost-and-found
// @desc    Create a new lost or found item post
// @access  Private
router.post('/', [
  protect,
  body('type').isIn(['lost', 'found']),
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('description').trim().isLength({ min: 10, max: 1000 }),
  body('category').trim().notEmpty(),
  body('location').trim().notEmpty(),
  body('contact_info').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { type, title, description, category, location, contact_info, photo } = req.body;

    // Set expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const item = await LostAndFound.create({
      type,
      title,
      description,
      category,
      location,
      contact_info,
      photo: photo || null,
      posted_by: req.user._id,
      status: 'active',
      expires_at: expiresAt,
      views: 0
    });

    // Populate posted_by before sending response
    await item.populate('posted_by', 'name email');

    res.status(201).json({
      success: true,
      message: 'Item posted successfully',
      data: item
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   PUT /api/lost-and-found/:id
// @desc    Update a lost and found item
// @access  Private (Owner only)
router.put('/:id', [
  protect,
  body('title').optional().trim().isLength({ min: 3, max: 200 }),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }),
  body('category').optional().trim(),
  body('location').optional().trim(),
  body('contact_info').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    let item = await LostAndFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    // Check if user is the owner
    if (item.posted_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this item' 
      });
    }

    const updateFields = {};
    const allowedFields = ['title', 'description', 'category', 'location', 'contact_info', 'photo'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    item = await LostAndFound.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('posted_by', 'name email');

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   DELETE /api/lost-and-found/:id
// @desc    Delete a lost and found item
// @access  Private (Owner or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await LostAndFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    // Check if user is the owner or admin
    const isOwner = item.posted_by.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this item' 
      });
    }

    await LostAndFound.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   POST /api/lost-and-found/:id/claim
// @desc    Claim a lost or found item
// @access  Private
router.post('/:id/claim', protect, async (req, res) => {
  try {
    const item = await LostAndFound.findById(req.params.id)
      .populate('posted_by', 'name email contact_info');

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    if (item.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: 'This item has already been claimed' 
      });
    }

    // Prevent users from claiming their own items
    if (item.posted_by._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot claim your own item' 
      });
    }

    // Update item status
    item.status = 'claimed';
    item.claimed_by = req.user._id;
    item.claimed_at = new Date();
    await item.save();

    // Create notification for the poster
    const Notification = require('../models/Notification');
    await Notification.create({
      user_id: item.posted_by._id,
      type: 'lostfound',
      title: `Someone claimed your ${item.type} item!`,
      message: `${req.user.name} has claimed "${item.title}". Contact: ${req.user.email}`,
      reference_type: 'lost_and_found',
      reference_id: item._id,
      priority: 'high'
    });

    res.json({
      success: true,
      message: 'Claim submitted successfully! The poster will contact you.',
      data: {
        item_title: item.title,
        poster_name: item.posted_by.name,
        poster_contact: item.contact_info
      }
    });
  } catch (error) {
    console.error('Error claiming item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   GET /api/lost-and-found/my/items
// @desc    Get current user's lost and found items
// @access  Private
router.get('/my/items', protect, async (req, res) => {
  try {
    const items = await LostAndFound.find({ posted_by: req.user._id })
      .populate('claimed_by', 'name email')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error fetching user items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   POST /api/lost-and-found/:id/verify-claim
// @desc    Verify and confirm a claim (owner only)
// @access  Private
router.post('/:id/verify-claim', protect, async (req, res) => {
  try {
    const item = await LostAndFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    // Check if user is the owner
    if (item.posted_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to verify this claim' 
      });
    }

    if (item.status !== 'claimed') {
      return res.status(400).json({ 
        success: false, 
        message: 'No claim to verify' 
      });
    }

    // Mark as verified
    item.claim_verified = true;
    await item.save();

    res.json({
      success: true,
      message: 'Claim verified successfully',
      data: item
    });
  } catch (error) {
    console.error('Error verifying claim:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;
