// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// ✅ LOST & FOUND - Import Lost & Found routes (finalized implementation)
const lostAndFoundRoutes = require('./routes/lostAndFoundRoutes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.log('❌ MongoDB Error:', err.message));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoute'); // ✅ FIXED
const eventRoutes = require('./routes/eventRoutes');
// ✅ ADMIN & DASHBOARD - Import admin and dashboard routes (finalized implementation)
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Backend is working!' });
});

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/marketplace', marketplaceRoutes); // ✅ FIXED - This connects all marketplace routes
app.use('/api/events', eventRoutes);
// ✅ LOST & FOUND - Register Lost & Found routes at /api/lost-and-found endpoint
// This enables all Lost & Found functionality: GET all items, GET single item, GET my items,
// POST create item, PUT update item, DELETE item, POST claim item
app.use('/api/lost-and-found', lostAndFoundRoutes);
// ✅ ADMIN & DASHBOARD - Register admin and dashboard routes
// Admin routes: GET flagged content, PUT update flags, DELETE content
// Dashboard routes: GET stats, GET recent activity
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
// ✅ NOTIFICATIONS & ANNOUNCEMENTS - Register notification and announcement routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', announcementRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});