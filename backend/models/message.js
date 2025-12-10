const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  conversation_id: {
    type: String,
    required: true,
    unique: true
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
    ref: 'MarketplaceListing'
  },
  listing_type: {
    type: String,
    default: 'marketplace'
  },
  participants: [{
    user_id: String,
    name: String,
    email: String
  }],
  last_message: {
    type: String
  },
  last_message_by: {
    type: String
  },
  last_message_at: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  unread_count: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const messageSchema = new mongoose.Schema({
  message_id: {
    type: String,
    required: true,
    unique: true
  },
  conversation_id: {
    type: String,
    required: true,
    ref: 'Conversation'
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
    required: true
  },
  is_read: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
conversationSchema.index({ participant1: 1, participant2: 1 });
conversationSchema.index({ updated_at: -1 });
messageSchema.index({ conversation_id: 1, created_at: -1 });
messageSchema.index({ sender_id: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = { Conversation, Message };