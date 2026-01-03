const mongoose = require('mongoose');

const lostAndFoundSchema = new mongoose.Schema({
  item_id: { 
    type: String, 
    unique: true,
    default: () => `LF-${Date.now()}`
  },
  type: { 
    type: String, 
    enum: ['lost', 'found'], 
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  photo: String,
  
  // Matches 'user_id' string from your auth system
  posted_by: { 
    type: String, 
    required: true, 
    ref: 'User' 
  },
  
  status: { 
    type: String, 
    enum: ['active', 'claimed', 'expired'], 
    default: 'active' 
  },
  
  claimed_by: { type: String, ref: 'User' },
  claimed_at: Date,
  contact_info: { type: String },
  views: { type: Number, default: 0 },
  expires_at: Date
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

module.exports = mongoose.model('LostAndFound', lostAndFoundSchema);