const Announcement = require('../models/Announcement');
const User = require('../models/User');

// Generate unique announcement ID
const generateAnnouncementId = () => {
  return `ANN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// @desc    Get all published announcements
// @route   GET /api/announcements
// @access  Public
exports.getAnnouncements = async (req, res) => {
  try {
    const { department, category, search, page = 1, limit = 20 } = req.query;
    
    // Build filter - only published announcements
    const filter = { 
      is_published: true,
      $or: [
        { expires_at: { $exists: false } },
        { expires_at: null },
        { expires_at: { $gte: new Date() } }
      ]
    };

    // Filter by department (empty means all departments)
    if (department && department.trim() !== '') {
      filter.$or = [
        { department: department.trim() },
        { department: '' } // Include announcements for all departments
      ];
    }

    // Filter by category
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query - pinned first, then by date
    const announcements = await Announcement.find(filter)
      .sort({ is_pinned: -1, created_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Announcement.countDocuments(filter);

    res.json({
      success: true,
      data: announcements,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching announcements',
      error: error.message
    });
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Public
exports.getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findOne({
      announcement_id: req.params.id,
      is_published: true
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Increment view count
    await announcement.incrementViews();

    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching announcement',
      error: error.message
    });
  }
};

// @desc    Create announcement (Admin only)
// @route   POST /api/announcements
// @access  Private/Admin
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, department, is_pinned, expires_at } = req.body;
    const adminId = req.user.user_id;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Get admin info
    const admin = await User.findOne({ user_id: adminId });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Create announcement
    const announcement = await Announcement.create({
      announcement_id: generateAnnouncementId(),
      title,
      content,
      category: category || 'General',
      department: department || '',
      posted_by: adminId,
      author: {
        user_id: adminId,
        name: admin.name,
        role: admin.role
      },
      is_pinned: is_pinned || false,
      is_published: true,
      expires_at: expires_at ? new Date(expires_at) : null
    });

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating announcement',
      error: error.message
    });
  }
};

// @desc    Update announcement (Admin only)
// @route   PUT /api/announcements/:id
// @access  Private/Admin
exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findOne({
      announcement_id: req.params.id
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Update fields
    const allowedUpdates = ['title', 'content', 'category', 'department', 'is_pinned', 'is_published', 'expires_at'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        announcement[field] = req.body[field];
      }
    });

    await announcement.save();

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating announcement',
      error: error.message
    });
  }
};

// @desc    Delete announcement (Admin only)
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findOne({
      announcement_id: req.params.id
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await announcement.deleteOne();

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting announcement',
      error: error.message
    });
  }
};

// @desc    Toggle pin status (Admin only)
// @route   PATCH /api/announcements/:id/pin
// @access  Private/Admin
exports.togglePin = async (req, res) => {
  try {
    const announcement = await Announcement.findOne({
      announcement_id: req.params.id
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    announcement.is_pinned = !announcement.is_pinned;
    await announcement.save();

    res.json({
      success: true,
      message: `Announcement ${announcement.is_pinned ? 'pinned' : 'unpinned'} successfully`,
      data: announcement
    });
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling pin',
      error: error.message
    });
  }
};

