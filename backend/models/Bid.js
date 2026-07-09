// ============================================
// models/Bid.js - Bid Model
// Task 799 - MERN Auction Platform
// ============================================

const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: [true, 'Bid must belong to an auction'],
    },
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Bid must belong to a user'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide a bid amount'],
      min: [1, 'Bid amount must be at least 1'],
    },
  },
  { timestamps: true }
);

// Index for sorting bids by amount
bidSchema.index({ auction: 1, amount: -1 });
bidSchema.index({ bidder: 1 });

module.exports = mongoose.model('Bid', bidSchema);
