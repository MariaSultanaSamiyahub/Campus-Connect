import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, ArrowLeft, Search, User, Clock } from 'lucide-react';
import './Marketplace.css';

const API_BASE = 'http://localhost:5000/api/marketplace';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE}/conversations`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/messages/${conversationId}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data || []);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !token) return;

    try {
      const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          conversationId: selectedConversation.conversation_id,
          content: newMessage.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessages([...messages, data.data]);
        setNewMessage('');
        scrollToBottom();
        fetchConversations();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.conversation_id);
  };

  const getOtherUser = (conversation) => {
    if (!conversation || !userId) return null;
    return conversation.participants?.find(p => p.user_id !== userId);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (selectedConversation) {
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.conversation_id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherUser(conv);
    return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!token) {
    return (
      <div className="page-container center-content">
        <div className="login-required">
          <MessageCircle size={64} color="#9ca3af" />
          <h2>Please Login</h2>
          <p>You need to be logged in to view messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container-full">
      {/* Header */}
      <div className="messages-header">
        <h1 className="messages-title">
          <MessageCircle size={24} /> Messages
        </h1>
      </div>

      {/* Main Content */}
      <div className="messages-content">
        {/* Conversations List */}
        <div className="conversations-sidebar">
          {/* Search */}
          <div className="search-container">
            <div style={{ position: 'relative' }}>
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-messages"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="conversations-list">
            {filteredConversations.length === 0 ? (
              <div className="no-conversations">
                <MessageCircle size={48} className="no-conversations-icon" />
                <p>No conversations yet</p>
                <p className="no-conversations-text">Start messaging sellers from the marketplace!</p>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const otherUser = getOtherUser(conv);
                const isSelected = selectedConversation?.conversation_id === conv.conversation_id;
                const unreadCount = conv.unread_count?.get?.(userId) || 0;

                return (
                  <div
                    key={conv.conversation_id}
                    onClick={() => selectConversation(conv)}
                    className={`conversation-item ${isSelected ? 'conversation-item-selected' : ''}`}
                  >
                    <div className="conversation-content">
                      <div className="conversation-avatar">
                        {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="conversation-details">
                        <div className="conversation-header">
                          <h3 className="conversation-name">
                            {otherUser?.name || 'Unknown User'}
                          </h3>
                          <span className="conversation-time">
                            {formatTime(conv.last_message_at || conv.updated_at)}
                          </span>
                        </div>
                        <div className="conversation-footer">
                          <p className="conversation-preview">
                            {conv.last_message || 'No messages yet'}
                          </p>
                          {unreadCount > 0 && (
                            <span className="unread-badge">{unreadCount}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-avatar">
                  {getOtherUser(selectedConversation)?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <h2 className="chat-user-name">
                    {getOtherUser(selectedConversation)?.name || 'Unknown User'}
                  </h2>
                  <p className="chat-user-email">
                    {getOtherUser(selectedConversation)?.email || ''}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-container">
                {loading ? (
                  <div className="loading-container">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="loading-container">
                    <MessageCircle size={48} className="empty-state-icon" />
                    <p>No messages yet</p>
                    <p className="no-conversations-text">Start the conversation!</p>
                  </div>
                ) : (
                  <div className="messages-list">
                    {messages.map((msg) => {
                      const isMyMessage = msg.sender_id === userId;
                      return (
                        <div
                          key={msg.message_id}
                          className={isMyMessage ? 'message-wrapper-sent' : 'message-wrapper-received'}
                        >
                          <div className={`message-bubble ${isMyMessage ? 'message-bubble-sent' : 'message-bubble-received'}`}>
                            <p className="message-text">{msg.content}</p>
                            <div className="message-time">
                              <Clock size={12} />
                              {formatTime(msg.created_at)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="message-input-container">
                <div className="message-input-wrapper">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="message-input"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className={`btn-send ${newMessage.trim() ? 'btn-send-active' : 'btn-send-disabled'}`}
                  >
                    <Send size={18} /> Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-chat">
              <div className="empty-chat-content">
                <MessageCircle size={64} className="empty-chat-icon" />
                <h3 className="empty-chat-title">Select a conversation</h3>
                <p className="empty-chat-text">Choose a conversation from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}