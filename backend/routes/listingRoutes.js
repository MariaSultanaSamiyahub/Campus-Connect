const express = require('express');
const router = express.Router();
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

// Protected routes (will need auth middleware later)
router.post('/', createListing);
router.put('/:id', updateListing);
router.delete('/:id', deleteListing);
router.get('/my/listings', getMyListings);

module.exports = router;