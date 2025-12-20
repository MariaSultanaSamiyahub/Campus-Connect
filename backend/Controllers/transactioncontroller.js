const Transaction = require('../models/Transaction');
const User = require('../models/User');
const MarketplaceListing = require('../models/MarketplaceListing');

// Generate unique transaction ID
const generateTransactionId = () => {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// @desc    Create transaction (mark as sold)
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res) => {
  try {
    const { listingId, buyerId } = req.body;
    const sellerId = req.user?.user_id;

    // Validate authentication
    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!listingId || !buyerId) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID and buyer ID are required'
      });
    }

    // Get listing
    const listing = await MarketplaceListing.findOne({
      listing_id: listingId,
      seller_id: sellerId
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or you are not the seller'
      });
    }

    if (listing.status === 'sold') {
      return res.status(400).json({
        success: false,
        message: 'Item already sold'
      });
    }

    // Get buyer and seller info
    const seller = await User.findOne({ user_id: sellerId });
    const buyer = await User.findOne({ user_id: buyerId });

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      transaction_id: generateTransactionId(),
      listing_id: listingId,
      seller_id: sellerId,
      buyer_id: buyerId,
      seller: {
        user_id: sellerId,
        name: seller?.name || 'Seller',
        email: seller?.email || 'seller@example.com'
      },
      buyer: {
        user_id: buyerId,
        name: buyer.name,
        email: buyer.email
      },
      status: 'pending'
    });

    // Update listing status
    listing.status = 'sold';
    await listing.save();

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating transaction',
      error: error.message
    });
  }
};

// @desc    Get user's transactions
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    // Validate authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { type = 'all' } = req.query; // all, buyer, seller

    let filter = {};
    
    if (type === 'buyer') {
      filter.buyer_id = userId;
    } else if (type === 'seller') {
      filter.seller_id = userId;
    } else {
      filter.$or = [
        { buyer_id: userId },
        { seller_id: userId }
      ];
    }

    const transactions = await Transaction.find(filter)
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transactions',
      error: error.message
    });
  }
};

// @desc    Rate and review transaction
// @route   POST /api/transactions/:id/rate
// @access  Private
exports.rateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user?.user_id;

    // Validate authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const transaction = await Transaction.findOne({
      transaction_id: id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user is buyer or seller
    const isBuyer = transaction.buyer_id === userId;
    const isSeller = transaction.seller_id === userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this transaction'
      });
    }

    // Update transaction with rating
    if (isBuyer) {
      if (transaction.buyer_rating) {
        return res.status(400).json({
          success: false,
          message: 'You have already rated this transaction'
        });
      }
      transaction.buyer_rating = rating;
      transaction.buyer_review = review || '';

      // Update seller's rating
      const seller = await User.findOne({ user_id: transaction.seller_id });
      if (seller) {
        seller.calculateRating(rating);
        await seller.save();
      }
    } else if (isSeller) {
      if (transaction.seller_rating) {
        return res.status(400).json({
          success: false,
          message: 'You have already rated this transaction'
        });
      }
      transaction.seller_rating = rating;
      transaction.seller_review = review || '';

      // Update buyer's rating
      const buyer = await User.findOne({ user_id: transaction.buyer_id });
      if (buyer) {
        buyer.calculateRating(rating);
        await buyer.save();
      }
    }

    // Mark as completed if both rated
    if (transaction.buyer_rating && transaction.seller_rating) {
      transaction.status = 'completed';
      transaction.completed_at = new Date();
    }

    await transaction.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Rate transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rating transaction',
      error: error.message
    });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.user_id;

    // Validate authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const transaction = await Transaction.findOne({
      transaction_id: id,
      $or: [
        { buyer_id: userId },
        { seller_id: userId }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or access denied'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transaction',
      error: error.message
    });
  }
};