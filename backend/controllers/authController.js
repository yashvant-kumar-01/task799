// ============================================
// controllers/authController.js - Auth Logic
// Task 799 - MERN Auction Platform
// ============================================

const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const CustomError = require('../utils/customError');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new CustomError('Email already in use', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role === 'admin' ? 'user' : role || 'user', // Prevent registering as admin directly
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    throw new CustomError('Please provide an email and password', 400);
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new CustomError('Invalid credentials', 401);
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new CustomError('Invalid credentials', 401);
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Logout user / clear cookie/token
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// ─── Helper: Send JWT Token ─────────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
