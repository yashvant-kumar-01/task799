// ============================================
// controllers/notificationController.js - Notifications Logic
// Task 799 - MERN Auction Platform
// ============================================

const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const CustomError = require('../utils/customError');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort('-createdAt')
    .populate('relatedAuction', 'title image');

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications,
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new CustomError('Notification not found', 404);
  }

  // Ensure notification belongs to user
  if (notification.user.toString() !== req.user.id) {
    throw new CustomError('Not authorized to access this notification', 403);
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user.id, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
