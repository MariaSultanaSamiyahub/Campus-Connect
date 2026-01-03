const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user by custom user_id field (not MongoDB _id)
    const user = await User.findOne({ user_id: decoded.user_id }).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Attach user with both custom user_id and MongoDB _id
    req.user = {
      id: user._id.toString(),  // MongoDB ObjectId for Event.organizer
      _id: user._id,
      user_id: user.user_id,    // Custom user ID
      name: user.name,
      email: user.email,
      role: user.role           // Add role for admin middleware
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};