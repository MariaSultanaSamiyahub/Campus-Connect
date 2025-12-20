const MarketplaceListing = require('../models/MarketplaceListing');
const User = require('../models/User');

// Generate unique listing ID
const generateListingId = () => {
  return `LST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// @desc    Create new listing
// @route   POST /api/listings
// @access  Private
exports.createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      condition,
      images,
      location
    } = req.body;

    // Validate authentication
    const sellerId = req.user?.user_id;
    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Validate required fields
    if (!title || !description || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Get seller info from database
    const seller = await User.findOne({ user_id: sellerId });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    const sellerInfo = {
      user_id: sellerId,
      name: seller.name,
      email: seller.email,
      rating: seller.rating
    };

    const listing = await MarketplaceListing.create({
      listing_id: generateListingId(),
      title,
      description,
      category,
      price,
      condition: condition || 'Good',
      images: images || [],
      thumbnail: images?.[0] || '',
      location: location || 'Campus',
      seller_id: sellerId,
      seller: sellerInfo,
      status: 'active',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: listing
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating listing',
      error: error.message
    });
  }
};

// @desc    Get all listings with filters
// @route   GET /api/listings
// @access  Public
exports.getAllListings = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      condition,
      search,
      sortBy = 'created_at',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    // Execute query
    const listings = await MarketplaceListing.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    const total = await MarketplaceListing.countDocuments(filter);

    res.json({
      success: true,
      data: listings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listings',
      error: error.message
    });
  }
};

// @desc    Get single listing by ID
// @route   GET /api/listings/:id
// @access  Public
exports.getListingById = async (req, res) => {
  try {
    const listing = await MarketplaceListing.findOne({
      listing_id: req.params.id
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Increment view count
    await listing.incrementViews();

    res.json({
      success: true,
      data: listing
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listing',
      error: error.message
    });
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private
exports.updateListing = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    // Validate authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const listing = await MarketplaceListing.findOne({
      listing_id: req.params.id
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if user is the seller
    if (listing.seller_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing'
      });
    }

    // Update fields
    const allowedUpdates = ['title', 'description', 'price', 'condition', 'images', 'location', 'status'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    await listing.save();

    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: listing
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating listing',
      error: error.message
    });
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private
exports.deleteListing = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    // Validate authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const listing = await MarketplaceListing.findOne({
      listing_id: req.params.id
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if user is the seller
    if (listing.seller_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing'
      });
    }

    // Soft delete by changing status
    listing.status = 'removed';
    await listing.save();

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting listing',
      error: error.message
    });
  }
};

// @desc    Get user's listings
// @route   GET /api/listings/my-listings
// @access  Private
exports.getMyListings = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    // Validate authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const listings = await MarketplaceListing.find({
      seller_id: userId
    }).sort({ created_at: -1 });

    res.json({
      success: true,
      data: listings,
      count: listings.length
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your listings',
      error: error.message
    });
  }
};