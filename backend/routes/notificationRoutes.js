// ============================================
// routes/notificationRoutes.js - Notification Routes
// Task 799 - MERN Auction Platform
// ============================================

const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// All notification routes are protected
router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

module.exports = router;
