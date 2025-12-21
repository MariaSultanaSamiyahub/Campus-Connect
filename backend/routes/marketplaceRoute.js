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
  
  // Product Ratings (NEW)
  rateProduct,
  getProductReviews,
  
  // Cart (NEW)
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  
  // Orders (NEW)
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  
  // Messaging
  startConversation,
  getConversations,
  sendMessage,
  getMessages,
  deleteConversation
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

// Product Ratings (NEW)
router.post('/listings/:id/rate', protect, rateProduct);
router.get('/listings/:id/reviews', getProductReviews);

// ========== CART ROUTES (NEW) ==========
router.post('/cart', protect, addToCart);
router.get('/cart', protect, getCart);
router.put('/cart', protect, updateCartItem);
router.delete('/cart/:listingId', protect, removeFromCart);
router.delete('/cart', protect, clearCart);

// ========== ORDER ROUTES (NEW) ==========
router.post('/orders', protect, createOrder);
router.get('/orders', protect, getMyOrders);
router.get('/orders/:id', protect, getOrderById);
router.put('/orders/:id/cancel', protect, cancelOrder);

// ========== MESSAGING ROUTES ==========
router.post('/conversations', protect, startConversation);
router.get('/conversations', protect, getConversations);
router.delete('/conversations/:conversationId', protect, deleteConversation);

router.post('/messages', protect, sendMessage);
router.get('/messages/:conversationId', protect, getMessages);

module.exports = router;