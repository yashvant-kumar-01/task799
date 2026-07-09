// ============================================
// middleware/auth.js - JWT Auth & Role Guard
// Task 799 - MERN Auction Platform
// ============================================

const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const CustomError = require('../utils/customError');
const User = require('../models/User');

// ─── Protect Middleware ──────────────────────────────────────────────────────
// Verifies JWT token from Authorization header
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new CustomError('Not authorized. No token provided.', 401);
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Get user from DB (exclude password)
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    throw new CustomError('User belonging to this token no longer exists.', 401);
  }

  req.user = user; // Attach user to request object
  next();
});

// ─── Authorize Middleware ────────────────────────────────────────────────────
// Restricts access to specific roles
// Usage: authorize('admin'), authorize('seller', 'admin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError(
        `Access denied. Role '${req.user.role}' is not authorized for this action.`,
        403
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
