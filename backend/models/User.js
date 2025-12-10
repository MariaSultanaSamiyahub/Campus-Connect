const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },
  department: {
    type: String,
    trim: true
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  total_ratings: {
    type: Number,
    default: 0
  },
  is_approved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

// Method to calculate rating
userSchema.methods.calculateRating = function(newRating) {
  const totalScore = (this.rating * this.total_ratings) + newRating;
  this.total_ratings += 1;
  this.rating = totalScore / this.total_ratings;
  return this.rating;
};

module.exports = mongoose.model('User', userSchema);