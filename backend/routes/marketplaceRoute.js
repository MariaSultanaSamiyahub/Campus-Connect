const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  // Listings
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,
  addToFavorites,
  removeFromFavorites,
  getMyFavorites,
  
  // Messaging
  startConversation,
  getConversations,
  sendMessage,
  getMessages,
  deleteConversation,
  
  // Transactions
  createTransaction,
  getTransactions,
  getTransactionById,
  rateTransaction
} = require('../controllers/marketplaceController');

// ========== LISTING ROUTES ==========
router.post('/listings', protect, createListing);
router.get('/listings', getAllListings); // Public - browse marketplace
router.get('/listings/my', protect, getMyListings);
router.get('/listings/:id', getListingById); // Public - view details
router.put('/listings/:id', protect, updateListing);
router.delete('/listings/:id', protect, deleteListing);

// Favorites
router.post('/listings/:id/favorite', protect, addToFavorites);
router.delete('/listings/:id/favorite', protect, removeFromFavorites);
router.get('/favorites', protect, getMyFavorites);

// ========== MESSAGING ROUTES ==========
router.post('/conversations', protect, startConversation);
router.get('/conversations', protect, getConversations);
router.delete('/conversations/:conversationId', protect, deleteConversation);

router.post('/messages', protect, sendMessage);
router.get('/messages/:conversationId', protect, getMessages);

// ========== TRANSACTION ROUTES ==========
router.post('/transactions', protect, createTransaction);
router.get('/transactions', protect, getTransactions);
router.get('/transactions/:id', protect, getTransactionById);
router.post('/transactions/:id/rate', protect, rateTransaction);

module.exports = router;