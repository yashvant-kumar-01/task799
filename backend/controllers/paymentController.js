// ============================================
// controllers/paymentController.js - Razorpay Logic
// Task 799 - MERN Auction Platform
// ============================================

const crypto = require('crypto');
const Razorpay = require('razorpay');
const Auction = require('../models/Auction');
const asyncHandler = require('../utils/asyncHandler');
const CustomError = require('../utils/customError');

// @desc    Create a Razorpay order
// @route   POST /api/payments/order
// @access  Private (Winner Only)
const createOrder = asyncHandler(async (req, res, next) => {
  const { auctionId } = req.body;

  const auction = await Auction.findById(auctionId);
  if (!auction) {
    throw new CustomError('Auction not found', 404);
  }

  // Verify that the auction is closed
  if (auction.status !== 'closed') {
    throw new CustomError('Auction is not closed yet', 400);
  }

  // Verify that the logged-in user is the winner
  if (!auction.winner || auction.winner.toString() !== req.user.id) {
    throw new CustomError('You did not win this auction, not authorized to pay', 403);
  }

  // Verify that payment is not already done
  if (auction.paymentStatus === 'paid') {
    throw new CustomError('This auction has already been paid for', 400);
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // Fallback to Simulation / Mock Mode if Razorpay credentials are not configured
  const isMockMode = !keyId || !keySecret || keyId === 'your_razorpay_key_id' || keySecret === 'your_razorpay_key_secret';

  if (isMockMode) {
    const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    auction.razorpayOrderId = mockOrderId;
    await auction.save();

    return res.status(200).json({
      success: true,
      mock: true,
      order_id: mockOrderId,
      amount: auction.currentPrice * 100,
      currency: 'INR',
      title: auction.title,
    });
  }

  // Initialize Razorpay
  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const options = {
    amount: Math.round(auction.currentPrice * 100), // Amount in paise/cents
    currency: 'INR',
    receipt: auction._id.toString(),
  };

  try {
    const order = await razorpay.orders.create(options);
    
    // Save Razorpay order ID to auction
    auction.razorpayOrderId = order.id;
    await auction.save();

    res.status(200).json({
      success: true,
      mock: false,
      keyId: keyId,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      title: auction.title,
    });
  } catch (error) {
    throw new CustomError(`Razorpay order creation failed: ${error.message}`, 500);
  }
});

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Private (Winner Only)
const verifyPayment = asyncHandler(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id) {
    throw new CustomError('Order ID is required', 400);
  }

  // Handle Mock verification
  if (razorpay_order_id.startsWith('order_mock_')) {
    const auction = await Auction.findOne({ razorpayOrderId: razorpay_order_id });
    if (!auction) {
      throw new CustomError('Auction associated with this mock order was not found', 404);
    }

    if (auction.winner.toString() !== req.user.id) {
      throw new CustomError('Not authorized to finalize this payment', 403);
    }

    auction.paymentStatus = 'paid';
    auction.razorpayPaymentId = razorpay_payment_id || `pay_mock_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    await auction.save();

    return res.status(200).json({
      success: true,
      message: 'Simulation Payment Successful & Verified!',
      paymentStatus: auction.paymentStatus,
    });
  }

  // Standard Razorpay verification
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new CustomError('Razorpay secret key not configured on server', 500);
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    throw new CustomError('Payment signature verification failed. Invalid transaction.', 400);
  }

  // Signature verified, update the database
  const auction = await Auction.findOne({ razorpayOrderId: razorpay_order_id });
  if (!auction) {
    throw new CustomError('Auction associated with this payment was not found', 404);
  }

  if (auction.winner.toString() !== req.user.id) {
    throw new CustomError('Not authorized to finalize this payment', 403);
  }

  auction.paymentStatus = 'paid';
  auction.razorpayPaymentId = razorpay_payment_id;
  await auction.save();

  res.status(200).json({
    success: true,
    message: 'Payment Verified & Captured Successfully!',
    paymentStatus: auction.paymentStatus,
  });
});

module.exports = {
  createOrder,
  verifyPayment,
};
