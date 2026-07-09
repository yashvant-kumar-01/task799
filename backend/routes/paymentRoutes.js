// ============================================
// routes/paymentRoutes.js - Razorpay Payment Routes
// Task 799 - MERN Auction Platform
// ============================================

const express = require('express');
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

module.exports = router;
