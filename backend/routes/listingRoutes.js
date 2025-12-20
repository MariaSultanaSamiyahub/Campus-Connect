const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings
} = require('../controllers/listingController');

// Public routes
router.get('/', getAllListings);
router.get('/:id', getListingById);

// Protected routes
router.post('/', protect, createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);
router.get('/my/listings', protect, getMyListings);

module.exports = router;