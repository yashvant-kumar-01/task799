// ============================================
// routes/adminRoutes.js - Admin Routes
// Task 799 - MERN Auction Platform
// ============================================

const express = require('express');
const {
  getReports,
  getMonthlyReport
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all admin routes and restrict to 'admin' role
router.use(protect, authorize('admin'));

router.get('/reports', getReports);
router.get('/reports/monthly', getMonthlyReport);

module.exports = router;
