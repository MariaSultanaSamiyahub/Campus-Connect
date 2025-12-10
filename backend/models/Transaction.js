const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transaction_id: {
    type: String,
    required: true,
    unique: true
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
  seller_rating: {
    type: Number,
    min: 1,
    max: 5
  },
  buyer_rating: {
    type: Number,
    min: 1,
    max: 5
  },
  seller_review: {
    type: String
  },
  buyer_review: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  completed_at: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes
transactionSchema.index({ seller_id: 1 });
transactionSchema.index({ buyer_id: 1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);