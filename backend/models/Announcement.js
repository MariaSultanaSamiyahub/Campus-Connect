const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  announcement_id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  category: {
    type: String,
    enum: ['Academic', 'General', 'Event', 'Important', 'Other'],
    default: 'General'
  },
  department: {
    type: String,
    trim: true,
    default: '' // Empty means all departments
  },
  posted_by: {
    type: String,
    required: true,
    ref: 'User'
  },
  author: {
    user_id: String,
    name: String,
    role: String
  },
  is_pinned: {
    type: Boolean,
    default: false
  },
  attachments: [{
    type: String
  }],
  view_count: {
    type: Number,
    default: 0
  },
  is_published: {
    type: Boolean,
    default: true
  },
  expires_at: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for performance
announcementSchema.index({ posted_by: 1 });
announcementSchema.index({ is_published: 1, created_at: -1 });
announcementSchema.index({ is_pinned: -1, created_at: -1 });
announcementSchema.index({ department: 1 });
announcementSchema.index({ category: 1 });
announcementSchema.index({ title: 'text', content: 'text' });

// Method to increment views
announcementSchema.methods.incrementViews = function() {
  this.view_count += 1;
  return this.save();
};

module.exports = mongoose.model('Announcement', announcementSchema);

