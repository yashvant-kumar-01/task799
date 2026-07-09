// ============================================
// config/db.js - MongoDB Connection
// Task 799 - MERN Auction Platform
// ============================================

const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Modern mongoose doesn't need useNewUrlParser / useUnifiedTopology
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed admin user if configured in env and does not exist
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const adminEmail = process.env.ADMIN_EMAIL.toLowerCase();
      const adminExists = await User.findOne({ email: adminEmail });
      if (!adminExists) {
        await User.create({
          name: 'System Admin',
          email: adminEmail,
          password: process.env.ADMIN_PASSWORD,
          role: 'admin'
        });
        console.log(`👤 Admin user auto-seeded: ${adminEmail}`);
      }
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
