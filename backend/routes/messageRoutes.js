const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  startConversation,
  getConversations,
  sendMessage,
  getMessages
} = require('../controllers/messageController');

// Conversation routes
router.post('/conversations', protect, startConversation);
router.get('/conversations', protect, getConversations);

// Message routes
router.post('/', protect, sendMessage);
router.get('/:conversationId', protect, getMessages);

module.exports = router;