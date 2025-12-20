const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an event title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add event description']
  },
  date: {
    type: Date,
    required: [true, 'Please add event date']
  },
  venue: {
    type: String,
    required: [true, 'Please add event venue']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizerName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Academic', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Social', 'Other'],
    default: 'Other'
  },
  capacity: {
    type: Number,
    default: null // null means unlimited
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['interested', 'going'],
      default: 'interested'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  image: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

// Virtual for number of attendees
eventSchema.virtual('attendeeCount').get(function() {
  return this.attendees.length;
});

// Method to check if event is full
eventSchema.methods.isFull = function() {
  if (!this.capacity) return false;
  return this.attendees.length >= this.capacity;
};

module.exports = mongoose.model('Event', eventSchema);