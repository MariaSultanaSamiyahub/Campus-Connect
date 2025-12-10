const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  rateTransaction,
  getTransactionById
} = require('../controllers/transactionController');

// All routes are protected (will need auth middleware later)
router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.post('/:id/rate', rateTransaction);

module.exports = router;