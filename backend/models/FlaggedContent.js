const mongoose = require('mongoose');

const flaggedContentSchema = new mongoose.Schema({
  content_type: { 
    type: String, 
    enum: ['listing', 'event', 'announcement', 'user', 'message'], 
    required: true 
  },
  content_id: { type: String, required: true },
  reported_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { 
    type: String, 
    enum: ['Spam', 'Inappropriate', 'Scam', 'Duplicate', 'Other'], 
    required: true 
  },
  title: String,
  description: String,
  status: { 
    type: String, 
    enum: ['pending', 'under_review', 'resolved', 'dismissed'], 
    default: 'pending' 
  },
  reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action_taken: String,
  review_notes: String,
  reviewed_at: Date
}, { timestamps: true });

module.exports = mongoose.model('FlaggedContent', flaggedContentSchema);
