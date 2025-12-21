const mongoose = require('mongoose');

const marketplaceListingSchema = new mongoose.Schema({
  listing_id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery', 'Sports', 'Other']
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
    type: String
  }],
  thumbnail: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'removed'],
    default: 'active'
  },
  seller_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  seller: {
    user_id: String,
    name: String,
    email: String,
    rating: Number
  },
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
    user_id: String,
    saved_at: {
      type: Date,
      default: Date.now
    }
  }],
  expires_at: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better query performance
marketplaceListingSchema.index({ seller_id: 1 });
marketplaceListingSchema.index({ status: 1, created_at: -1 });
marketplaceListingSchema.index({ category: 1 });
marketplaceListingSchema.index({ title: 'text', description: 'text' });

// Method to increment view count
marketplaceListingSchema.methods.incrementViews = function() {
  this.view_count += 1;
  return this.save();
};

module.exports = mongoose.model('MarketplaceListing', marketplaceListingSchema);