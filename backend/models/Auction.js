// ============================================
// models/Auction.js - Auction Model
// Task 799 - MERN Auction Platform
// ============================================

const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide auction title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide auction description'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/400x300?text=Auction+Item',
    },
    category: {
      type: String,
      enum: ['Electronics', 'Art', 'Jewelry', 'Vehicles', 'Collectibles', 'Fashion', 'Other'],
      default: 'Other',
    },
    startPrice: {
      type: Number,
      required: [true, 'Please provide a starting price'],
      min: [1, 'Starting price must be at least 1'],
    },
    currentPrice: {
      type: Number,
      default: function () {
        return this.startPrice;
      },
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'cancelled'],
      default: 'active',
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide auction end date'],
      validate: {
        validator: function (val) {
          // Only validate future date when the document is new or the end date is modified
          if (this && !this.isNew && !this.isModified('endDate')) {
            return true;
          }
          return val > Date.now();
        },
        message: 'End date must be in the future',
      },
    },
    totalBids: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: populate bids on auction
auctionSchema.virtual('bids', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'auction',
});

// Index for fast querying
auctionSchema.index({ status: 1, endDate: 1 });
auctionSchema.index({ seller: 1 });

module.exports = mongoose.model('Auction', auctionSchema);
