// ============================================
// server.js - Main Entry Point
// Task 799 - MERN Auction Platform
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const cron = require('node-cron');

// Load env vars
dotenv.config();

// Connect to DB
const connectDB = require('./config/db');
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Error middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Auction auto-close cron job
const { closeExpiredAuctions } = require('./controllers/auctionController');

const app = express();

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet()); // Set security HTTP headers

// CORS Configuration - supports multiple origins via comma-separated CLIENT_URL
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});
app.use('/api/', limiter);

// ─── General Middleware ─────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Routes ────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🔨 Auction Platform API - Task 799 is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      auctions: '/api/auctions',
      notifications: '/api/notifications',
      admin: '/api/admin',
      payments: '/api/payments',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// ─── Error Handling ─────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Cron Job: Auto-close expired auctions every minute ────────────────────
cron.schedule('* * * * *', () => {
  closeExpiredAuctions();
});

// ─── Start Server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📦 API ready at http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
