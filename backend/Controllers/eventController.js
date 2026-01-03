const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by status
    if (status) {
      query.status = status;
    } else {
      // By default, only show upcoming events
      query.status = 'upcoming';
    }

    // Search by title or venue
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 }); // Sort by date (earliest first)

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('❌ Get events error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('attendees.user', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('❌ Get event error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private
exports.createEvent = async (req, res) => {
  try {
    // Add organizer info to req.body
    req.body.organizer = req.user.id;
    req.body.organizerName = req.user.name;

    const event = await Event.create(req.body);

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('❌ Create event error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Make sure user is event organizer
    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('❌ Update event error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Make sure user is event organizer
    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('❌ Delete event error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    RSVP to event
// @route   POST /api/events/:id/rsvp
// @access  Private
exports.rsvpEvent = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.isFull()) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // ✅ CHANGED: Use _id (ObjectId) instead of id (string)
    const alreadyRSVP = event.attendees.find(
      attendee => attendee.user.toString() === req.user._id.toString()
    );

    if (alreadyRSVP) {
      alreadyRSVP.status = status || 'interested';
    } else {
      // ✅ CHANGED: Use _id (ObjectId) instead of id (string)
      event.attendees.push({
        user: req.user._id,  // Use ObjectId, not string
        status: status || 'interested'
      });
    }

    await event.save();

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('❌ RSVP event error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel RSVP
// @route   DELETE /api/events/:id/rsvp
// @access  Private
exports.cancelRSVP = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // ✅ CHANGED: Use _id (ObjectId) instead of id (string)
    event.attendees = event.attendees.filter(
      attendee => attendee.user.toString() !== req.user._id.toString()
    );

    await event.save();

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('❌ Cancel RSVP error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's registered events (Personal Calendar)
// @route   GET /api/events/my-events
// @access  Private
exports.getMyEvents = async (req, res) => {
  try {
    // ✅ CHANGED: Use _id (ObjectId) instead of id (string)
    const events = await Event.find({
      'attendees.user': req.user._id,  // Use ObjectId, not string
      date: { $gte: new Date() }
    })
      .populate('organizer', 'name email')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('❌ Get my events error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};