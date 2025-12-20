// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth routes working!' });
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, user_id, role } = req.body;
    
    // TODO: Add user to database
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { email, user_id, role }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // TODO: Verify user from database
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: 'dummy_token_123'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;