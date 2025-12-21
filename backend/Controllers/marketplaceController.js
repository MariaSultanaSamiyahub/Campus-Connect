const { MarketplaceListing, Cart, Order, Conversation, Message, Transaction } = require('../models/marketplace');
const User = require('../models/User'); 

// ID GENERATORS
const generateListingId = () => `LST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateCartId = () => `CART-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateOrderId = () => `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateConversationId = () => `CONV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateMessageId = () => `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateTransactionId = () => `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// DELIVERY CHARGE CONSTANT
const DELIVERY_CHARGE = 50; // Change this value to adjust delivery charge

// ========== LISTING FUNCTIONS ==========

// CREATE LISTING
exports.createListing = async (req, res) => {
  try {
    const { title, description, category, price, condition, images, location, stock, quantity } = req.body;
    const sellerId = req.user?.user_id;

    if (!sellerId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!title || !description || !category || !price) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    // MANDATORY: Check if images are provided
    if (!images || images.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one product image is required' });
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
      images, // MANDATORY
      thumbnail: images[0],
      location: location || 'Campus',
      stock: stock || 1,
      quantity: quantity || 1,
      seller_id: sellerId,
      seller: {
        user_id: sellerId,
        name: seller.name,
        email: seller.email
        // NO seller rating
      },
      status: 'active',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
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

    // Check if images are being updated and ensure at least one exists
    if (req.body.images !== undefined && req.body.images.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one product image is required' });
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'price', 'condition', 'images', 'location', 'status', 'stock', 'quantity'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    if (req.body.images) {
      listing.thumbnail = req.body.images[0] || listing.thumbnail;
    }

    // Auto mark as sold if stock/quantity = 0
    if (req.body.stock === 0 || req.body.quantity === 0) {
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
    listing.markModified('favorites');
    await listing.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Added to favorites', data: listing });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
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
    listing.markModified('favorites');
    await listing.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Removed from favorites', data: listing });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
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

// ========== PRODUCT RATING FUNCTIONS (UPDATED) ==========

// RATE PRODUCT (After purchase) - FIXED TO CHECK PURCHASE
// RATE PRODUCT (After purchase) - FIXED TO CHECK PURCHASE
exports.rateProduct = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const userId = req.user?.user_id;
    const listingId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1-5' });
    }

    const listing = await MarketplaceListing.findOne({ listing_id: listingId });
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // CRITICAL: Prevent seller from rating their own product
    if (listing.seller_id === userId) {
      return res.status(403).json({ success: false, message: 'You cannot rate your own product' });
    }

    // CRITICAL: Check if user has purchased this product
    const hasPurchased = await Order.findOne({
      user_id: userId,
      'items.listing_id': listingId,
      status: { $in: ['completed', 'delivered', 'confirmed', 'processing', 'shipped'] }
    });

    if (!hasPurchased) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only rate products you have purchased' 
      });
    }

    // Check if user already rated this product
    const existingReview = listing.reviews.find(r => r.user_id === userId);
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already rated this product' });
    }

    const user = await User.findOne({ user_id: userId });

    // Add review
    listing.reviews.push({
      user_id: userId,
      user_name: user?.name || 'Anonymous',
      rating: rating,
      review: review || '',
      created_at: new Date()
    });

    // Calculate new average rating
    listing.calculateRating(rating);

    await listing.save();

    res.json({ success: true, message: 'Product rated successfully', data: listing });
  } catch (error) {
    console.error('Rate product error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET PRODUCT REVIEWS
exports.getProductReviews = async (req, res) => {
  try {
    const listingId = req.params.id;

    const listing = await MarketplaceListing.findOne({ listing_id: listingId });
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.json({ 
      success: true, 
      data: {
        rating: listing.rating,
        total_ratings: listing.total_ratings,
        reviews: listing.reviews
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ========== CART FUNCTIONS (NEW) ==========

// ADD TO CART
exports.addToCart = async (req, res) => {
  try {
    const { listingId, quantity = 1 } = req.body;
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const listing = await MarketplaceListing.findOne({ listing_id: listingId, status: 'active' });
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
    }

    if (listing.quantity < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user_id: userId });

    if (!cart) {
      cart = await Cart.create({
        cart_id: generateCartId(),
        user_id: userId,
        items: []
      });
    }

    const existingItem = cart.items.find(item => item.listing_id === listingId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        listing_id: listingId,
        title: listing.title,
        price: listing.price,
        quantity: quantity,
        images: listing.images,
        seller_id: listing.seller_id,
        seller_name: listing.seller.name,
        added_at: new Date()
      });
    }

    cart.calculateTotal();
    await cart.save();

    res.json({ success: true, message: 'Added to cart', data: cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET CART
exports.getCart = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    let cart = await Cart.findOne({ user_id: userId });

    if (!cart) {
      cart = await Cart.create({
        cart_id: generateCartId(),
        user_id: userId,
        items: []
      });
    }

    res.json({ success: true, data: cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE CART ITEM QUANTITY
exports.updateCartItem = async (req, res) => {
  try {
    const { listingId, quantity } = req.body;
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find(item => item.listing_id === listingId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    const listing = await MarketplaceListing.findOne({ listing_id: listingId });
    if (listing && listing.quantity < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    item.quantity = quantity;
    cart.calculateTotal();
    await cart.save();

    res.json({ success: true, message: 'Cart updated', data: cart });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// REMOVE FROM CART
exports.removeFromCart = async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.listing_id !== listingId);
    cart.calculateTotal();
    await cart.save();

    res.json({ success: true, message: 'Item removed from cart', data: cart });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// CLEAR CART
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = [];
    cart.total_amount = 0;
    await cart.save();

    res.json({ success: true, message: 'Cart cleared', data: cart });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ========== ORDER FUNCTIONS (NEW) ==========

// CREATE ORDER (Checkout)
exports.createOrder = async (req, res) => {
  try {
    const { deliveryOption, deliveryAddress, phoneNumber, paymentMethod, notes } = req.body;
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!deliveryOption || !['campus', 'home'].includes(deliveryOption)) {
      return res.status(400).json({ success: false, message: 'Invalid delivery option. Choose "campus" or "home"' });
    }

    if (deliveryOption === 'home' && !deliveryAddress) {
      return res.status(400).json({ success: false, message: 'Delivery address required for home delivery' });
    }

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Verify stock availability and reduce quantities
    for (const item of cart.items) {
      const listing = await MarketplaceListing.findOne({ listing_id: item.listing_id });
      
      if (!listing || listing.status !== 'active') {
        return res.status(400).json({ 
          success: false, 
          message: `Product "${item.title}" is no longer available` 
        });
      }

      if (listing.quantity < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for "${item.title}". Only ${listing.quantity} available` 
        });
      }

      // REDUCE PRODUCT QUANTITY
      listing.quantity -= item.quantity;
      
      // Auto mark as sold if quantity reaches 0
      if (listing.quantity === 0) {
        listing.status = 'sold';
      }

await listing.save({ validateBeforeSave: false });
    }

    const user = await User.findOne({ user_id: userId });
    const subtotal = cart.total_amount;
    const deliveryCharge = deliveryOption === 'home' ? DELIVERY_CHARGE : 0;
    const totalAmount = subtotal + deliveryCharge;

    const order = await Order.create({
      order_id: generateOrderId(),
      user_id: userId,
      buyer: {
        user_id: userId,
        name: user?.name || 'User',
        email: user?.email || 'user@example.com'
      },
      items: cart.items,
      subtotal: subtotal,
      delivery_charge: deliveryCharge,
      total_amount: totalAmount,
      delivery_option: deliveryOption,
      delivery_address: deliveryAddress || 'Campus Pickup',
      phone_number: phoneNumber || user?.phone || '',
      payment_method: paymentMethod || 'cash',
      payment_status: 'pending',
      status: 'pending',
      notes: notes || ''
    });

    // Clear cart after successful order
    cart.items = [];
    cart.total_amount = 0;
    await cart.save();

    res.status(201).json({ 
      success: true, 
      message: 'Order placed successfully', 
      data: order 
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET MY ORDERS
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const orders = await Order.find({ user_id: userId }).sort({ created_at: -1 });

    res.json({ success: true, data: orders, count: orders.length });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET ORDER BY ID
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const orderId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const order = await Order.findOne({ order_id: orderId, user_id: userId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// CANCEL ORDER
exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const orderId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const order = await Order.findOne({ order_id: orderId, user_id: userId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled' });
    }

    // Restore product quantities
    for (const item of order.items) {
      const listing = await MarketplaceListing.findOne({ listing_id: item.listing_id });
      if (listing) {
        listing.quantity += item.quantity;
        if (listing.status === 'sold') {
          listing.status = 'active';
        }
        await listing.save();
      }
    }

    order.status = 'cancelled';
    order.cancelled_at = new Date();
    await order.save();

    res.json({ success: true, message: 'Order cancelled', data: order });
  } catch (error) {
    console.error('Cancel order error:', error);
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