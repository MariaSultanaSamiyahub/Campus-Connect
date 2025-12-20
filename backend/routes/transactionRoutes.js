const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createTransaction,
  getTransactions,
  rateTransaction,
  getTransactionById
} = require('../controllers/transactionController');

// All routes are protected
router.post('/', protect, createTransaction);
router.get('/', protect, getTransactions);
router.get('/:id', protect, getTransactionById);
router.post('/:id/rate', protect, rateTransaction);

module.exports = router;