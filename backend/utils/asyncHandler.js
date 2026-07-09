// ============================================
// utils/asyncHandler.js - Async Wrapper
// Task 799 - MERN Auction Platform
// ============================================

/**
 * asyncHandler wraps async route handlers to catch
 * any errors and pass them to Express error middleware.
 *
 * Without this, you'd need try/catch in every controller.
 *
 * Usage:
 *   router.get('/route', asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
