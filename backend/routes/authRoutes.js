const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const User = require('../models/User'); 


// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);


// GET ALL USERS (For Admin Panel)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password'); 
    res.json(users);
  } catch (error) {
    console.error(error); // Log the error to see it in terminal
    res.status(500).json({ message: "Server Error fetching users" });
  }
});


module.exports = router;