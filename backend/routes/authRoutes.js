// ============================================
// routes/authRoutes.js - Auth Routes
// Task 799 - MERN Auction Platform
// ============================================

const express = require('express');
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
