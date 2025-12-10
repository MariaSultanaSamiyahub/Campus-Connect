const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Temporary auth middleware (replace with proper JWT auth later)
app.use((req, res, next) => {
  // Mock user for testing - remove this when you implement real auth
  req.user = {
    user_id: 'USER-001',
    name: 'Test User',
    email: 'test@example.com',
    role: 'seller',
    rating: 4.5
  };
  next();
});

// Import routes
const listingRoutes = require('./routes/listingRoutes');
const messageRoutes = require('./routes/messageRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// Basic test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Campus Connect - Buy & Sell Marketplace',
    status: 'Running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    database: 'Connected',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/listings', listingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/transactions', transactionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Define PORT from environment variables
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`================================`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
    console.log(`================================`);
    console.log(`\n📍 Available endpoints:`);
    console.log(`   GET    /api/listings - Get all listings`);
    console.log(`   POST   /api/listings - Create listing`);
    console.log(`   GET    /api/listings/:id - Get single listing`);
    console.log(`   PUT    /api/listings/:id - Update listing`);
    console.log(`   DELETE /api/listings/:id - Delete listing`);
    console.log(`   GET    /api/messages/conversations - Get conversations`);
    console.log(`   POST   /api/messages - Send message`);
    console.log(`   POST   /api/transactions - Create transaction`);
    console.log(`   POST   /api/transactions/:id/rate - Rate transaction`);
    console.log(`================================\n`);
});