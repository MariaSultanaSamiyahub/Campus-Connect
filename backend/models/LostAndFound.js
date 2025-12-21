// backend/models/LostAndFound.js
const mongoose = require('mongoose');

const lostAndFoundSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['lost', 'found']
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
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Electronics', 
      'Books', 
      'Clothing', 
      'Accessories', 
      'Keys', 
      'ID Cards', 
      'Bags', 
      'Sports Equipment', 
      'Other'
    ]
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  photo: {
    type: String,
    default: null
  },
  posted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'claimed', 'expired'],
    default: 'active'
  },
  claimed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  claimed_at: {
    type: Date,
    default: null
  },
  claim_verified: {
    type: Boolean,
    default: false
  },
  contact_info: {
    type: String,
    required: true,
    trim: true
  },
  views: {
    type: Number,
    default: 0
  },
  expires_at: {
    type: Date,
    default: function() {
      // Default expiration: 30 days from creation
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    }
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Indexes for better query performance
lostAndFoundSchema.index({ type: 1, status: 1 });
lostAndFoundSchema.index({ posted_by: 1 });
lostAndFoundSchema.index({ category: 1 });
lostAndFoundSchema.index({ created_at: -1 });
lostAndFoundSchema.index({ title: 'text', description: 'text' });
lostAndFoundSchema.index({ expires_at: 1 });

// Method to increment view count
lostAndFoundSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Static method to auto-expire old items
lostAndFoundSchema.statics.expireOldItems = async function() {
  const now = new Date();
  const result = await this.updateMany(
    { 
      expires_at: { $lt: now },
      status: 'active'
    },
    { 
      $set: { status: 'expired' } 
    }
  );
  return result;
};

// Pre-save hook to validate
lostAndFoundSchema.pre('save', function(next) {
  // Ensure claimed items have claimed_by and claimed_at
  if (this.status === 'claimed' && !this.claimed_at) {
    this.claimed_at = new Date();
  }
  next();
});

// Virtual for time since posted
lostAndFoundSchema.virtual('time_since_posted').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.created_at);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
});

// Virtual for days until expiration
lostAndFoundSchema.virtual('days_until_expiration').get(function() {
  if (!this.expires_at) return null;
  const now = new Date();
  const diffTime = this.expires_at - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Ensure virtuals are included in JSON
lostAndFoundSchema.set('toJSON', { virtuals: true });
lostAndFoundSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('LostAndFound', lostAndFoundSchema);
