// ============================================
// models/Notification.js - Notification Model
// Task 799 - MERN Auction Platform
// ============================================

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification must belong to a user'],
    },
    message: {
      type: String,
      required: [true, 'Notification must have a message'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    type: {
      type: String,
      enum: ['bid_placed', 'auction_ended', 'winner_declared', 'general'],
      default: 'general',
    },
    relatedAuction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for fetching user notifications quickly
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
