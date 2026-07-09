// ============================================
// routes/auctionRoutes.js - Auction Routes
// Task 799 - MERN Auction Platform
// ============================================

const express = require('express');
const {
  createAuction,
  getAuctions,
  getAuction,
  updateAuction,
  deleteAuction,
  placeBid,
  getHighestBid,
  getWonAuctions,
} = require('../controllers/auctionController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// IMPORTANT: /won must be BEFORE /:id to avoid being caught as an ID param
router.get('/won', protect, getWonAuctions);

router
  .route('/')
  .get(getAuctions)
  .post(protect, authorize('seller', 'admin'), createAuction);

router
  .route('/:id')
  .get(getAuction)
  .put(protect, authorize('seller', 'admin'), updateAuction)
  .delete(protect, authorize('seller', 'admin'), deleteAuction);

router.post('/:id/bids', protect, authorize('user', 'seller'), placeBid);
router.get('/:id/highest-bid', getHighestBid);

module.exports = router;
