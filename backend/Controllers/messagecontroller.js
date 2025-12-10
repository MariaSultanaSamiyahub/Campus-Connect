const { Conversation, Message } = require('../models/Message');

// Generate unique IDs
const generateConversationId = () => {
  return `CONV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const generateMessageId = () => {
  return `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// @desc    Start or get conversation
// @route   POST /api/messages/conversations
// @access  Private
exports.startConversation = async (req, res) => {
  try {
    const { otherUserId, listingId } = req.body;
    const currentUserId = req.user?.user_id || 'USER-001';

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'Other user ID is required'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      $or: [
        { participant1: currentUserId, participant2: otherUserId },
        { participant1: otherUserId, participant2: currentUserId }
      ],
      listing_id: listingId
    });

    if (conversation) {
      return res.json({
        success: true,
        data: conversation,
        message: 'Existing conversation found'
      });
    }

    // Create new conversation
    conversation = await Conversation.create({
      conversation_id: generateConversationId(),
      participant1: currentUserId,
      participant2: otherUserId,
      listing_id: listingId,
      participants: [
        {
          user_id: currentUserId,
          name: req.user?.name || 'User 1',
          email: req.user?.email || 'user1@example.com'
        },
        {
          user_id: otherUserId,
          name: 'User 2', // This should come from database
          email: 'user2@example.com'
        }
      ],
      unread_count: {
        [currentUserId]: 0,
        [otherUserId]: 0
      }
    });

    res.status(201).json({
      success: true,
      data: conversation,
      message: 'Conversation created successfully'
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting conversation',
      error: error.message
    });
  }
};

// @desc    Get user's conversations
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user?.user_id || 'USER-001';

    const conversations = await Conversation.find({
      $or: [
        { participant1: userId },
        { participant2: userId }
      ],
      status: 'active'
    }).sort({ last_message_at: -1, updated_at: -1 });

    res.json({
      success: true,
      data: conversations,
      count: conversations.length
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching conversations',
      error: error.message
    });
  }
};

// @desc    Send message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user?.user_id || 'USER-001';

    if (!conversationId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID and content are required'
      });
    }

    // Find conversation
    const conversation = await Conversation.findOne({
      conversation_id: conversationId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Create message
    const message = await Message.create({
      message_id: generateMessageId(),
      conversation_id: conversationId,
      sender_id: senderId,
      sender: {
        user_id: senderId,
        name: req.user?.name || 'User'
      },
      content,
      is_read: false
    });

    // Update conversation
    const otherUserId = conversation.participant1 === senderId 
      ? conversation.participant2 
      : conversation.participant1;

    conversation.last_message = content;
    conversation.last_message_by = senderId;
    conversation.last_message_at = new Date();
    
    // Increment unread count for other user
    const unreadCount = conversation.unread_count.get(otherUserId) || 0;
    conversation.unread_count.set(otherUserId, unreadCount + 1);
    
    await conversation.save();

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message',
      error: error.message
    });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.user_id || 'USER-001';
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      conversation_id: conversationId,
      $or: [
        { participant1: userId },
        { participant2: userId }
      ]
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({
      conversation_id: conversationId
    })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Message.countDocuments({
      conversation_id: conversationId
    });

    // Mark messages as read
    await Message.updateMany(
      {
        conversation_id: conversationId,
        sender_id: { $ne: userId },
        is_read: false
      },
      { is_read: true }
    );

    // Reset unread count for current user
    conversation.unread_count.set(userId, 0);
    await conversation.save();

    res.json({
      success: true,
      data: messages.reverse(), // Return in chronological order
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages',
      error: error.message
    });
  }
};