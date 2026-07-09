// ============================================
// middleware/errorMiddleware.js - Error Handlers
// Task 799 - MERN Auction Platform
// ============================================

const CustomError = require('../utils/customError');

// ─── 404 Not Found Middleware ───────────────────────────────────────────────
// Catches any request that doesn't match a route
const notFound = (req, res, next) => {
  const error = new CustomError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
};

// ─── Global Error Handler ────────────────────────────────────────────────────
// All errors eventually come here via next(error)
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ── Mongoose CastError (invalid ObjectId) ──
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ── Mongoose Duplicate Key (e.g., email already exists) ──
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue).join(', ');
    message = `Duplicate value for field: ${field}. Please use a different value.`;
  }

  // ── Mongoose Validation Error ──
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // ── JWT Errors ──
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your token has expired. Please log in again.';
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    // Only show stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
