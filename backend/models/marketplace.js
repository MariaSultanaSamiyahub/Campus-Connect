const mongoose = require('mongoose');

// ========== MARKETPLACE LISTING SCHEMA ==========
const marketplaceListingSchema = new mongoose.Schema({
  listing_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery', 'Sports', 'Makeup', 
           'Beauty & Skincare', 'Food & Snacks', 'Kitchen & Dining', 'Musical Instruments', 
           'Art Supplies', 'Pet Supplies', 'Home Decor', 'Gaming', 'Other']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  images: [{
    type: String,
    required: true, // At least one image is MANDATORY
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid image URL'
    }
  }],
  thumbnail: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    default: 1,
    min: 0
  },
  quantity: {
    type: Number,
    default: 1,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'removed'],
    default: 'active'
  },
  seller_id: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  seller: {
    user_id: String,
    name: String,
    email: String
    // REMOVED: rating (no longer showing seller rating on items)
  },
  // NEW: Product Rating System (buyers rate the product, not seller)
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  total_ratings: {
    type: Number,
    default: 0
  },
  reviews: [{
    user_id: {
      type: String,
      required: true,
      ref: 'User'
    },
    user_name: String,
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      maxlength: 500
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  is_featured: {
    type: Boolean,
    default: false
  },
  is_reserved: {
    type: Boolean,
    default: false
  },
  view_count: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    default: 'Campus'
  },
  favorites: [{
    user_id: {
      type: String,
      required: true
    },
    saved_at: {
      type: Date,
      default: Date.now
    }
  }],
  expires_at: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes
marketplaceListingSchema.index({ seller_id: 1 });
marketplaceListingSchema.index({ status: 1, created_at: -1 });
marketplaceListingSchema.index({ category: 1, status: 1 });
marketplaceListingSchema.index({ price: 1 });
marketplaceListingSchema.index({ rating: -1 });
marketplaceListingSchema.index({ title: 'text', description: 'text' });
marketplaceListingSchema.index({ 'favorites.user_id': 1 });

// Virtual for favorite count
marketplaceListingSchema.virtual('favorite_count').get(function() {
  return this.favorites.length;
});

// Method to check if listing is expired
marketplaceListingSchema.methods.isExpired = function() {
  return this.expires_at && this.expires_at < new Date();
};

// Method to increment view count
marketplaceListingSchema.methods.incrementViews = function() {
  this.view_count += 1;
  return this.save();
};

// Method to calculate product rating
marketplaceListingSchema.methods.calculateRating = function(newRating) {
  const totalScore = (this.rating * this.total_ratings) + newRating;
  this.total_ratings += 1;
  this.rating = parseFloat((totalScore / this.total_ratings).toFixed(1));
  return this.rating;
};

marketplaceListingSchema.set('toJSON', { virtuals: true });
marketplaceListingSchema.set('toObject', { virtuals: true });

// ========== CART SCHEMA (NEW) ==========
const cartSchema = new mongoose.Schema({
  cart_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user_id: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  items: [{
    listing_id: {
      type: String,
      required: true,
      ref: 'MarketplaceListing'
    },
    title: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    images: [String],
    seller_id: String,
    seller_name: String,
    added_at: {
      type: Date,
      default: Date.now
    }
  }],
  total_amount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Method to calculate cart total
cartSchema.methods.calculateTotal = function() {
  this.total_amount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return this.total_amount;
};

cartSchema.index({ user_id: 1 });

// ========== ORDER SCHEMA (NEW) ==========
const orderSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user_id: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  buyer: {
    user_id: String,
    name: String,
    email: String
  },
  items: [{
    listing_id: String,
    title: String,
    price: Number,
    quantity: Number,
    seller_id: String,
    seller_name: String,
    images: [String]
  }],
  subtotal: {
    type: Number,
    required: true
  },
  delivery_charge: {
    type: Number,
    default: 0
  },
  total_amount: {
    type: Number,
    required: true
  },
  delivery_option: {
    type: String,
    enum: ['campus', 'home'],
    required: true
  },
  delivery_address: {
    type: String
  },
  phone_number: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  payment_method: {
    type: String,
    enum: ['cash', 'online', 'bank_transfer'],
    default: 'cash'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  completed_at: {
    type: Date
  },
  cancelled_at: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

orderSchema.index({ user_id: 1, created_at: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ order_id: 1 });

// ========== CONVERSATION SCHEMA ==========
const conversationSchema = new mongoose.Schema({
  conversation_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  participant1: {
    type: String,
    required: true,
    ref: 'User'
  },
  participant2: {
    type: String,
    required: true,
    ref: 'User'
  },
  listing_id: {
    type: String,
    ref: 'MarketplaceListing',
    index: true
  },
  participants: [{
    user_id: String,
    name: String,
    email: String
  }],
  last_message: {
    type: String,
    default: ''
  },
  last_message_by: {
    type: String
  },
  last_message_at: {
    type: Date,
    default: Date.now
  },
  unread_count: {
    type: Map,
    of: Number,
    default: {}
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

conversationSchema.index({ participant1: 1, participant2: 1 });
conversationSchema.index({ last_message_at: -1 });
conversationSchema.index({ status: 1 });
conversationSchema.index({ participant1: 1, participant2: 1, listing_id: 1 });

// ========== MESSAGE SCHEMA ==========
const messageSchema = new mongoose.Schema({
  message_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  conversation_id: {
    type: String,
    required: true,
    ref: 'Conversation',
    index: true
  },
  sender_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  sender: {
    user_id: String,
    name: String
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  is_read: {
    type: Boolean,
    default: false
  },
  attachments: [{
    type: String,
    url: String
  }]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

messageSchema.index({ conversation_id: 1, created_at: -1 });
messageSchema.index({ sender_id: 1 });

// ========== TRANSACTION SCHEMA (Updated for reviews) ==========
const transactionSchema = new mongoose.Schema({
  transaction_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  listing_id: {
    type: String,
    required: true,
    ref: 'MarketplaceListing'
  },
  seller_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  buyer_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  seller: {
    user_id: String,
    name: String,
    email: String
  },
  buyer: {
    user_id: String,
    name: String,
    email: String
  },
  amount: {
    type: Number,
    min: 0
  },
  quantity: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  payment_method: {
    type: String,
    enum: ['cash', 'online', 'bank_transfer'],
    default: 'cash'
  },
  // Product rating by buyer
  product_rating: {
    type: Number,
    min: 1,
    max: 5
  },
  product_review: {
    type: String,
    maxlength: 500
  },
  completed_at: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

transactionSchema.index({ seller_id: 1, created_at: -1 });
transactionSchema.index({ buyer_id: 1, created_at: -1 });
transactionSchema.index({ listing_id: 1 });
transactionSchema.index({ status: 1 });

// ========== EXPORT ALL MODELS ==========
const MarketplaceListing = mongoose.model('MarketplaceListing', marketplaceListingSchema);
const Cart = mongoose.model('Cart', cartSchema);
const Order = mongoose.model('Order', orderSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);
const Message = mongoose.model('Message', messageSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = {
  MarketplaceListing,
  Cart,
  Order,
  Conversation,
  Message,
  Transaction
};