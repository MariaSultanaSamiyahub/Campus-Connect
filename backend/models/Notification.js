const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notification_id: {
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
  type: {
    type: String,
    enum: ['announcement', 'order', 'message', 'event', 'marketplace', 'system', 'lostfound'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  reference_type: {
    type: String,
    enum: ['announcement', 'order', 'message', 'event', 'listing', null],
    default: null
  },
  reference_id: {
    type: String,
    default: null
  },
  is_read: {
    type: Boolean,
    default: false,
    index: true
  },
  is_pushed: {
    type: Boolean,
    default: false
  },
  is_emailed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  read_at: {
    type: Date
  },
  user: {
    user_id: String,
    email: String
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for performance
notificationSchema.index({ user_id: 1, created_at: -1 });
notificationSchema.index({ user_id: 1, is_read: 1 });
notificationSchema.index({ notification_id: 1 }, { unique: true });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.is_read = true;
  this.read_at = new Date();
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);

