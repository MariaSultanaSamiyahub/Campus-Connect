const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { protect } = require('../middleware/auth');
const LostAndFound = require('../models/LostAndFound');
const Notification = require('../models/Notification'); 

// GET ALL ITEMS (with enhanced filtering)
router.get('/', [
  query('type').optional().isIn(['lost', 'found']),
  query('status').optional().isIn(['active', 'claimed', 'expired']),
  query('category').optional()
], async (req, res) => {
  try {
    const { type, category, search, status = 'active' } = req.query;
    let query = { status };
    
    if (type) query.type = type;
    if (category && category !== 'All') query.category = category;
    
    // ✅ LOST & FOUND - Enhanced search with better error handling
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    
    const items = await LostAndFound.find(query)
      .populate('posted_by', 'name email')
      .populate('claimed_by', 'name email')
      .sort({ created_at: -1 })
      .limit(50);
    
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    console.error('Get items error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch items. Please try again.' });
  }
});

// GET MY ITEMS (user's own lost and found items)
router.get('/my-items', protect, async (req, res) => {
  try {
    const items = await LostAndFound.find({ posted_by: req.user._id })
      .populate('posted_by', 'name email')
      .populate('claimed_by', 'name email')
      .sort({ created_at: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET SINGLE ITEM BY ID
router.get('/:id', async (req, res) => {
  try {
    // ✅ LOST & FOUND - Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid item ID format' });
    }

    const item = await LostAndFound.findById(req.params.id)
      .populate('posted_by', 'name email')
      .populate('claimed_by', 'name email');
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Increment views
    await item.incrementViews();

    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Get item error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE ITEM
router.post('/', [
  protect,
  body('type').isIn(['lost', 'found']).withMessage('Type must be either lost or found'),
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description').trim().isLength({ min: 5, max: 1000 }).withMessage('Description must be between 5 and 1000 characters'),
  body('category').isIn(['Electronics', 'Books', 'Clothing', 'Accessories', 'Keys', 'ID Cards', 'Bags', 'Sports Equipment', 'Other']).withMessage('Invalid category'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('contact_info').trim().notEmpty().withMessage('Contact information is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const item = await LostAndFound.create({
      ...req.body,
      posted_by: req.user._id,
      status: 'active'
    });
    await item.populate('posted_by', 'name email');
    res.status(201).json({ success: true, message: 'Item posted successfully', data: item });
  } catch (error) {
    console.error('Create item error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to create item' });
  }
});

// UPDATE ITEM (only by owner)
router.put('/:id', [
  protect,
  body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description').optional().trim().isLength({ min: 5, max: 1000 }).withMessage('Description must be between 5 and 1000 characters'),
  body('category').optional().isIn(['Electronics', 'Books', 'Clothing', 'Accessories', 'Keys', 'ID Cards', 'Bags', 'Sports Equipment', 'Other']).withMessage('Invalid category'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('contact_info').optional().trim().notEmpty().withMessage('Contact information cannot be empty')
], async (req, res) => {
  try {
    // ✅ LOST & FOUND - Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid item ID format' });
    }

    const item = await LostAndFound.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Check if user is the owner
    if (item.posted_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this item' });
    }

    // Don't allow updating if already claimed
    if (item.status === 'claimed') {
      return res.status(400).json({ success: false, message: 'Cannot update a claimed item' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Update only provided fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== 'posted_by' && key !== 'status' && key !== 'claimed_by' && key !== 'type') {
        item[key] = req.body[key];
      }
    });

    await item.save();
    await item.populate('posted_by', 'name email');

    res.json({ success: true, message: 'Item updated successfully', data: item });
  } catch (error) {
    console.error('Update item error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to update item' });
  }
});

// DELETE ITEM (only by owner)
router.delete('/:id', protect, async (req, res) => {
  try {
    // ✅ LOST & FOUND - Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid item ID format' });
    }

    const item = await LostAndFound.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Check if user is the owner
    if (item.posted_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
    }

    await LostAndFound.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete item' });
  }
});

// CLAIM ITEM
router.post('/:id/claim', protect, async (req, res) => {
  try {
    // ✅ LOST & FOUND - Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid item ID format' });
    }

    const item = await LostAndFound.findById(req.params.id).populate('posted_by');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    if (item.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Item is not available for claiming' });
    }
    
    if (item.posted_by._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot claim your own item' });
    }

    item.status = 'claimed';
    item.claimed_by = req.user._id;
    item.claimed_at = new Date();
    await item.save();

    // Notify Poster
    try {
      await Notification.create({
        user_id: item.posted_by._id,
        type: 'lostfound',
        title: `Item Claimed: ${item.title}`,
        message: `${req.user.name} has claimed your ${item.type} item. Please contact them to verify.`,
        priority: 'high'
      });
    } catch (err) {
      console.error('Notification error (ignoring):', err.message);
    }

    res.json({ success: true, message: 'Claim submitted! The owner has been notified.' });
  } catch (error) {
    console.error('Claim item error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to claim item' });
  }
});

module.exports = router;