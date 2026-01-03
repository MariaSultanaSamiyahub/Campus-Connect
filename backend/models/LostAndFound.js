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
      'Electronics', 'Books', 'Clothing', 'Accessories', 
      'Keys', 'ID Cards', 'Bags', 'Sports Equipment', 'Other'
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
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    }
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes
lostAndFoundSchema.index({ type: 1, status: 1 });
lostAndFoundSchema.index({ posted_by: 1 });
lostAndFoundSchema.index({ category: 1 });
lostAndFoundSchema.index({ created_at: -1 });
lostAndFoundSchema.index({ title: 'text', description: 'text' });

// Methods
lostAndFoundSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

lostAndFoundSchema.statics.expireOldItems = async function() {
  const now = new Date();
  return await this.updateMany(
    { expires_at: { $lt: now }, status: 'active' },
    { $set: { status: 'expired' } }
  );
};

// Virtuals
lostAndFoundSchema.set('toJSON', { virtuals: true });
lostAndFoundSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('LostAndFound', lostAndFoundSchema);