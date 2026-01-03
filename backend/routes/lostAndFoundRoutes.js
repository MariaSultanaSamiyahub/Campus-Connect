const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { protect } = require('../middleware/auth');
const LostAndFound = require('../models/LostAndFound');
const Notification = require('../models/Notification'); 

// GET ALL ITEMS
router.get('/', [
  query('type').optional().isIn(['lost', 'found']),
  query('status').optional().isIn(['active', 'claimed', 'expired'])
], async (req, res) => {
  try {
    const { type, category, search, status = 'active' } = req.query;
    let query = { status };
    if (type) query.type = type;
    if (category) query.category = category;
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
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE ITEM
router.post('/', [
  protect,
  body('type').isIn(['lost', 'found']),
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('description').trim().isLength({ min: 5, max: 1000 }), // Min length 5
  body('category').trim().notEmpty(),
  body('location').trim().notEmpty(),
  body('contact_info').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const item = await LostAndFound.create({
      ...req.body,
      posted_by: req.user._id,
      status: 'active'
    });
    await item.populate('posted_by', 'name email');
    res.status(201).json({ success: true, message: 'Item posted successfully', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CLAIM ITEM
router.post('/:id/claim', protect, async (req, res) => {
  try {
    const item = await LostAndFound.findById(req.params.id).populate('posted_by');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.status !== 'active') return res.status(400).json({ message: 'Already claimed' });
    if (item.posted_by._id.toString() === req.user._id.toString()) return res.status(400).json({ message: 'Cannot claim your own item' });

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
            message: `${req.user.name} has claimed your item.`,
            priority: 'high'
        });
    } catch (err) { console.log("Notification error (ignoring):", err.message); }

    res.json({ success: true, message: 'Claim submitted!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;