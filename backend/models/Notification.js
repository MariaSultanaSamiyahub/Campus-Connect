const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['announcement', 'event', 'marketplace', 'lostfound', 'message', 'system'], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  is_read: { type: Boolean, default: false },
  reference_type: String,
  reference_id: String,
  read_at: Date
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
