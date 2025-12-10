const express = require('express');
const router = express.Router();
const {
  startConversation,
  getConversations,
  sendMessage,
  getMessages
} = require('../controllers/messageController');

// Conversation routes
router.post('/conversations', startConversation);
router.get('/conversations', getConversations);

// Message routes
router.post('/', sendMessage);
router.get('/:conversationId', getMessages);

module.exports = router;