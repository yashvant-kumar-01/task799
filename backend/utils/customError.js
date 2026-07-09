// ============================================
// utils/customError.js - Custom Error Class
// Task 799 - MERN Auction Platform
// ============================================

/**
 * CustomError extends the built-in Error class
 * to attach an HTTP status code to every error.
 *
 * Usage:
 *   throw new CustomError('User not found', 404);
 *   throw new CustomError('Unauthorized', 401);
 */
class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);          // Call parent Error constructor
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Marks this as a known/expected error

    // Captures the stack trace (excludes constructor from stack)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = CustomError;
