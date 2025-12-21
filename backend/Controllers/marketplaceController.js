const { MarketplaceListing, Conversation, Message, Transaction } = require('../models/marketplace');
const User = require('../models/User'); 

// ID GENERATORS
const generateListingId = () => `LST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateConversationId = () => `CONV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateMessageId = () => `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateTransactionId = () => `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ========== LISTING FUNCTIONS ==========

// CREATE LISTING
exports.createListing = async (req, res) => {
  try {
    const { title, description, category, price, condition, images, location, stock } = req.body;
    const sellerId = req.user?.user_id;

    if (!sellerId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!title || !description || !category || !price) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    const seller = await User.findOne({ user_id: sellerId });
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

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
      stock: stock || 1, // Number of items available
      seller_id: sellerId,
      seller: {
        user_id: sellerId,
        name: seller.name,
        email: seller.email,
        rating: seller.rating
      },
      status: 'active',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    res.status(201).json({ success: true, message: 'Listing created successfully', data: listing });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET ALL LISTINGS (Browse Marketplace)
exports.getAllListings = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, condition, search, sortBy = 'created_at', order = 'desc', page = 1, limit = 12 } = req.query;

    const filter = { status: 'active' };

    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const listings = await MarketplaceListing.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    const total = await MarketplaceListing.countDocuments(filter);

    res.json({
      success: true,
      data: listings,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET SINGLE LISTING (View Details)
exports.getListingById = async (req, res) => {
  try {
    const listing = await MarketplaceListing.findOne({ listing_id: req.params.id });

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Increment view count
    listing.view_count = (listing.view_count || 0) + 1;
    await listing.save();

    res.json({ success: true, data: listing });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE LISTING (Edit price, stock, condition, images)
exports.updateListing = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const listing = await MarketplaceListing.findOne({ listing_id: req.params.id });

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.seller_id !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'price', 'condition', 'images', 'location', 'status', 'stock'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    if (req.body.images) {
      listing.thumbnail = req.body.images[0] || listing.thumbnail;
    }

    // Auto mark as sold if stock = 0
    if (req.body.stock === 0) {
      listing.status = 'sold';
    } else if (req.body.status === 'active' && listing.stock > 0) {
      listing.status = 'active';
    }

    await listing.save();

    res.json({ success: true, message: 'Listing updated', data: listing });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE LISTING (Soft delete)
exports.deleteListing = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const listing = await MarketplaceListing.findOne({ listing_id: req.params.id });

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.seller_id !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    listing.status = 'removed';
    await listing.save();

    res.json({ success: true, message: 'Listing deleted' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET MY LISTINGS (Seller's own products)
exports.getMyListings = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const listings = await MarketplaceListing.find({ seller_id: userId }).sort({ created_at: -1 });

    res.json({ success: true, data: listings, count: listings.length });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ADD TO FAVORITES
exports.addToFavorites = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const listingId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const listing = await MarketplaceListing.findOne({ listing_id: listingId });
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Check if already in favorites
    const alreadyFavorite = listing.favorites.find(fav => fav.user_id === userId);
    if (alreadyFavorite) {
      return res.status(400).json({ success: false, message: 'Already in favorites' });
    }

    listing.favorites.push({ user_id: userId, saved_at: new Date() });
    await listing.save();

    res.json({ success: true, message: 'Added to favorites', data: listing });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// REMOVE FROM FAVORITES
exports.removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const listingId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const listing = await MarketplaceListing.findOne({ listing_id: listingId });
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    listing.favorites = listing.favorites.filter(fav => fav.user_id !== userId);
    await listing.save();

    res.json({ success: true, message: 'Removed from favorites', data: listing });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET MY FAVORITES
exports.getMyFavorites = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const listings = await MarketplaceListing.find({
      'favorites.user_id': userId,
      status: 'active'
    }).sort({ created_at: -1 });

    res.json({ success: true, data: listings, count: listings.length });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ========== MESSAGING FUNCTIONS ==========

// START CONVERSATION (Message seller)
exports.startConversation = async (req, res) => {
  try {
    const { otherUserId, listingId } = req.body;
    const currentUserId = req.user?.user_id;

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!otherUserId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      $or: [
        { participant1: currentUserId, participant2: otherUserId },
        { participant1: otherUserId, participant2: currentUserId }
      ],
      listing_id: listingId
    });

    if (conversation) {
      return res.json({ success: true, data: conversation, message: 'Conversation exists' });
    }

    // Fetch user info
    const currentUser = await User.findOne({ user_id: currentUserId });
    const otherUser = await User.findOne({ user_id: otherUserId });

    if (!otherUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create conversation
    conversation = await Conversation.create({
      conversation_id: generateConversationId(),
      participant1: currentUserId,
      participant2: otherUserId,
      listing_id: listingId,
      participants: [
        { user_id: currentUserId, name: currentUser?.name || 'User', email: currentUser?.email || 'unknown@example.com' },
        { user_id: otherUserId, name: otherUser.name || 'User', email: otherUser.email || 'unknown@example.com' }
      ],
      unread_count: { [currentUserId]: 0, [otherUserId]: 0 }
    });

    res.status(201).json({ success: true, data: conversation, message: 'Conversation created' });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET CONVERSATIONS (All chats)
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const conversations = await Conversation.find({
      $or: [{ participant1: userId }, { participant2: userId }],
      status: 'active'
    }).sort({ last_message_at: -1, updated_at: -1 });

    res.json({ success: true, data: conversations, count: conversations.length });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// SEND MESSAGE
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user?.user_id;

    if (!senderId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!conversationId || !content) {
      return res.status(400).json({ success: false, message: 'Conversation ID and content required' });
    }

    const conversation = await Conversation.findOne({ conversation_id: conversationId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const sender = await User.findOne({ user_id: senderId });

    const message = await Message.create({
      message_id: generateMessageId(),
      conversation_id: conversationId,
      sender_id: senderId,
      sender: { user_id: senderId, name: sender?.name || 'User' },
      content,
      is_read: false
    });

    // Update conversation
    const otherUserId = conversation.participant1 === senderId ? conversation.participant2 : conversation.participant1;
    conversation.last_message = content;
    conversation.last_message_by = senderId;
    conversation.last_message_at = new Date();
    
    const unreadCount = conversation.unread_count.get(otherUserId) || 0;
    conversation.unread_count.set(otherUserId, unreadCount + 1);
    
    await conversation.save();

    res.status(201).json({ success: true, data: message, message: 'Message sent' });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET MESSAGES (Chat history)
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findOne({
      conversation_id: conversationId,
      $or: [{ participant1: userId }, { participant2: userId }]
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({ conversation_id: conversationId })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Message.countDocuments({ conversation_id: conversationId });

    // Mark as read
    await Message.updateMany(
      { conversation_id: conversationId, sender_id: { $ne: userId }, is_read: false },
      { is_read: true }
    );

    conversation.unread_count.set(userId, 0);
    await conversation.save();

    res.json({
      success: true,
      data: messages.reverse(),
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE CONVERSATION
exports.deleteConversation = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const conversation = await Conversation.findOne({
      conversation_id: req.params.conversationId,
      $or: [{ participant1: userId }, { participant2: userId }]
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    conversation.status = 'archived';
    await conversation.save();

    res.json({ success: true, message: 'Conversation archived' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ========== TRANSACTION & RATING FUNCTIONS ==========

// CREATE TRANSACTION (Mark as sold)
exports.createTransaction = async (req, res) => {
  try {
    const { listingId, buyerId } = req.body;
    const sellerId = req.user?.user_id;

    if (!sellerId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!listingId || !buyerId) {
      return res.status(400).json({ success: false, message: 'Listing ID and buyer ID required' });
    }

    const listing = await MarketplaceListing.findOne({ listing_id: listingId, seller_id: sellerId });
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.status === 'sold') {
      return res.status(400).json({ success: false, message: 'Item already sold' });
    }

    const seller = await User.findOne({ user_id: sellerId });
    const buyer = await User.findOne({ user_id: buyerId });

    if (!buyer) {
      return res.status(404).json({ success: false, message: 'Buyer not found' });
    }

    const transaction = await Transaction.create({
      transaction_id: generateTransactionId(),
      listing_id: listingId,
      seller_id: sellerId,
      buyer_id: buyerId,
      seller: { user_id: sellerId, name: seller?.name || 'Seller', email: seller?.email || 'seller@example.com' },
      buyer: { user_id: buyerId, name: buyer.name, email: buyer.email },
      status: 'completed'
    });

    listing.status = 'sold';
    await listing.save();

    res.status(201).json({ success: true, message: 'Transaction created', data: transaction });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET TRANSACTIONS
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { type = 'all' } = req.query;

    let filter = {};
    if (type === 'buyer') {
      filter.buyer_id = userId;
    } else if (type === 'seller') {
      filter.seller_id = userId;
    } else {
      filter.$or = [{ buyer_id: userId }, { seller_id: userId }];
    }

    const transactions = await Transaction.find(filter).sort({ created_at: -1 });

    res.json({ success: true, data: transactions, count: transactions.length });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET TRANSACTION BY ID
exports.getTransactionById = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const transaction = await Transaction.findOne({
      transaction_id: req.params.id,
      $or: [{ buyer_id: userId }, { seller_id: userId }]
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// RATE & REVIEW
exports.rateTransaction = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
    }

    const transaction = await Transaction.findOne({ transaction_id: req.params.id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const isBuyer = transaction.buyer_id === userId;
    const isSeller = transaction.seller_id === userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (isBuyer) {
      if (transaction.buyer_rating) {
        return res.status(400).json({ success: false, message: 'Already rated' });
      }
      transaction.buyer_rating = rating;
      transaction.buyer_review = review || '';

      const seller = await User.findOne({ user_id: transaction.seller_id });
      if (seller) {
        seller.calculateRating(rating);
        await seller.save();
      }
    } else if (isSeller) {
      if (transaction.seller_rating) {
        return res.status(400).json({ success: false, message: 'Already rated' });
      }
      transaction.seller_rating = rating;
      transaction.seller_review = review || '';

      const buyer = await User.findOne({ user_id: transaction.buyer_id });
      if (buyer) {
        buyer.calculateRating(rating);
        await buyer.save();
      }
    }

    if (transaction.buyer_rating && transaction.seller_rating) {
      transaction.status = 'completed';
      transaction.completed_at = new Date();
    }

    await transaction.save();

    res.json({ success: true, message: 'Rating submitted', data: transaction });
  } catch (error) {
    console.error('Rate transaction error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  // Listings
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,
  addToFavorites,
  removeFromFavorites,
  getMyFavorites,
  
  // Messaging
  startConversation,
  getConversations,
  sendMessage,
  getMessages,
  deleteConversation,
  
  // Transactions
  createTransaction,
  getTransactions,
  getTransactionById,
  rateTransaction
};