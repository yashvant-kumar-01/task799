// ============================================
// seed-expired.js - Seed a won auction for manual/browser testing
// Task 799 - MERN Auction Platform
// ============================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Auction = require('./models/Auction');
const Bid = require('./models/Bid');
const { closeExpiredAuctions } = require('./controllers/auctionController');

dotenv.config();

async function seed() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // 1. Clean up old test buyer & seller
    await User.deleteMany({ email: { $in: ['buyer_test@example.com', 'seller_test@example.com'] } });
    await Auction.deleteMany({ title: 'Luxury Diamond Ring' });

    // 2. Create Seller
    const seller = await User.create({
      name: 'Test Seller',
      email: 'seller_test@example.com',
      password: 'Password123',
      role: 'seller',
    });
    console.log('👤 Created Seller:', seller.email);

    // 3. Create Buyer
    const buyer = await User.create({
      name: 'Test Buyer',
      email: 'buyer_test@example.com',
      password: 'Password123',
      role: 'user',
    });
    console.log('👤 Created Buyer:', buyer.email);

    // 4. Create Expired Auction (endDate is 5s ago)
    const auction = new Auction({
      title: 'Luxury Diamond Ring',
      description: 'An exquisite 18-karat white gold diamond ring.',
      startPrice: 450,
      currentPrice: 500,
      seller: seller._id,
      endDate: new Date(Date.now() - 5000), // Expired 5 seconds ago
      status: 'active',
      totalBids: 1,
    });
    await auction.save({ validateBeforeSave: false });
    console.log('💍 Created Expired Auction:', auction.title);

    // 5. Place winning bid for Buyer
    const bid = await Bid.create({
      auction: auction._id,
      bidder: buyer._id,
      amount: 500,
    });
    console.log('💰 Created Bid of $500 for Buyer');

    // 6. Run Cron closing routine
    console.log('⏰ Running closeExpiredAuctions routine...');
    await closeExpiredAuctions();
    console.log('🎉 Auction closed. Winner declared!');

    // 7. Verify result
    const updatedAuction = await Auction.findById(auction._id);
    console.log('📊 Closed Auction Status:', updatedAuction.status);
    console.log('🏆 Closed Auction Winner:', updatedAuction.winner ? 'Test Buyer' : 'None');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from DB.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
