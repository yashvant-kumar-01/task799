// ============================================
// test-backend.js - Automated API Integration Tests
// Task 799 - MERN Auction Platform
// ============================================

// Set environment variables for testing
process.env.NODE_ENV = 'development';
process.env.PORT = '5001';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/auction_platform_test';
process.env.JWT_SECRET = 'test_jwt_secret_key_extremely_long_and_secure';
process.env.JWT_EXPIRE = '1h';
process.env.ADMIN_EMAIL = 'admin@auction.com';
process.env.ADMIN_PASSWORD = 'Admin@12345';

const mongoose = require('mongoose');
const { closeExpiredAuctions } = require('./controllers/auctionController');

const BASE_URL = 'http://localhost:5001/api';

// Helper to print test headers
function printHeader(title) {
  console.log(`\n=== 🧪 ${title} ===`);
}

// Helper to make fetch requests easier
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  return {
    status: response.status,
    ok: response.ok,
    data,
  };
}

async function runTests() {
  console.log('🧪 Starting BidMaster Backend Integration Tests...');

  // 1. Connect to MongoDB and clear the test database
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🧹 Connected to test database. Clearing old test data...');
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
    console.log('✨ Test database reset completed.');
  } catch (error) {
    console.error('❌ Failed to clean up database:', error.message);
    process.exit(1);
  }

  // 2. Start the express server
  console.log('🚀 Launching backend server...');
  require('./server');

  // Wait for server to boot and establish DB connection
  await new Promise((resolve) => setTimeout(resolve, 3000));

  let buyer1Token, buyer2Token, sellerToken, adminToken;
  let buyer1Id, buyer2Id, sellerId;
  let auctionId, expiredAuctionId;
  let notificationId;

  let testPassedCount = 0;
  let testTotalCount = 0;

  function assert(condition, message) {
    testTotalCount++;
    if (condition) {
      testPassedCount++;
      console.log(` ✅ PASS: ${message}`);
    } else {
      console.error(` ❌ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // ─── TEST 1: ADMIN USER SEEDING ──────────────────────────────────────────
    printHeader('Test 1: Admin User Seeding');
    
    // Login with the auto-seeded admin credentials
    const adminLoginRes = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@auction.com',
        password: 'Admin@12345',
      }),
    });
    assert(adminLoginRes.status === 200, 'Admin login response is 200');
    assert(adminLoginRes.data.success === true, 'Admin login success is true');
    assert(adminLoginRes.data.user.role === 'admin', 'Logged in user has role admin');
    adminToken = adminLoginRes.data.token;

    // ─── TEST 2: AUTHENTICATION & REGISTRATION ───────────────────────────────
    printHeader('Test 2: Auth Registration & Role Restrictions');

    // Register Buyer 1
    const registerBuyer1 = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John BuyerOne',
        email: 'buyer1@example.com',
        password: 'Password123',
        role: 'user',
      }),
    });
    assert(registerBuyer1.status === 201, 'Buyer 1 registered successfully (201)');
    buyer1Token = registerBuyer1.data.token;
    buyer1Id = registerBuyer1.data.user._id;

    // Register Buyer 2
    const registerBuyer2 = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Bob BuyerTwo',
        email: 'buyer2@example.com',
        password: 'Password123',
        role: 'user',
      }),
    });
    assert(registerBuyer2.status === 201, 'Buyer 2 registered successfully (201)');
    buyer2Token = registerBuyer2.data.token;
    buyer2Id = registerBuyer2.data.user._id;

    // Register Seller
    const registerSeller = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Sarah Seller',
        email: 'seller@example.com',
        password: 'Password123',
        role: 'seller',
      }),
    });
    assert(registerSeller.status === 201, 'Seller registered successfully (201)');
    sellerToken = registerSeller.data.token;
    sellerId = registerSeller.data.user._id;

    // Prevent direct admin registration
    const registerFakeAdmin = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Fake Admin',
        email: 'fakeadmin@example.com',
        password: 'Password123',
        role: 'admin',
      }),
    });
    assert(registerFakeAdmin.status === 201, 'Fake Admin registration returned 201');
    assert(registerFakeAdmin.data.user.role === 'user', 'Fake Admin role was downgraded to user');

    // ─── TEST 3: AUCTION CREATION ────────────────────────────────────────────
    printHeader('Test 3: Auction Creation & Field Validation');

    // Create valid auction (ends in 1 hour)
    const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    const createAuctionRes = await apiRequest('/auctions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: JSON.stringify({
        title: 'Premium Antique Watch',
        description: 'A beautiful mechanical watch from the 1960s.',
        startPrice: 100,
        category: 'Jewelry',
        endDate: futureDate,
      }),
    });
    assert(createAuctionRes.status === 201, 'Seller created auction successfully (201)');
    auctionId = createAuctionRes.data.data._id;
    assert(createAuctionRes.data.data.currentPrice === 100, 'Initial currentPrice is equal to startPrice');

    // Attempt to create auction with past end date (should fail)
    const pastDate = new Date(Date.now() - 10 * 1000); // 10s ago
    const failAuctionRes = await apiRequest('/auctions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: JSON.stringify({
        title: 'Expired Watch',
        description: 'Failed creation.',
        startPrice: 50,
        endDate: pastDate,
      }),
    });
    assert(failAuctionRes.status === 400, 'Auction with past end date fails validation (400)');

    // ─── TEST 4: BIDDING LOGIC & SECURITY ────────────────────────────────────
    printHeader('Test 4: Bidding Flow & Validations');

    // Buyer 1 places a valid bid of 110
    const bid1Res = await apiRequest(`/auctions/${auctionId}/bids`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${buyer1Token}` },
      body: JSON.stringify({ amount: 110 }),
    });
    assert(bid1Res.status === 201, 'Buyer 1 placed bid of $110 (201)');
    assert(bid1Res.data.message === 'Bid placed successfully', 'Bid response contains success message');

    // Seller tries to bid on own auction (should fail)
    const sellerBidRes = await apiRequest(`/auctions/${auctionId}/bids`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: JSON.stringify({ amount: 120 }),
    });
    assert(sellerBidRes.status === 400, 'Seller cannot bid on own auction (400)');
    assert(sellerBidRes.data.message.includes('cannot bid on your own'), 'Correct error message for seller bidding');

    // Buyer 1 tries to bid lower than current price (should fail)
    const lowBidRes = await apiRequest(`/auctions/${auctionId}/bids`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${buyer1Token}` },
      body: JSON.stringify({ amount: 105 }),
    });
    assert(lowBidRes.status === 400, 'Bid lower than current price fails (400)');

    // Buyer 2 places a higher bid of 130
    const bid2Res = await apiRequest(`/auctions/${auctionId}/bids`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${buyer2Token}` },
      body: JSON.stringify({ amount: 130 }),
    });
    assert(bid2Res.status === 201, 'Buyer 2 placed bid of $130 (201)');

    // Verify auction fields updated
    const getAuctionRes = await apiRequest(`/auctions/${auctionId}`);
    assert(getAuctionRes.data.data.currentPrice === 130, 'Current price updated to $130');
    assert(getAuctionRes.data.data.totalBids === 2, 'Total bids count is 2');

    // ─── TEST 5: NOTIFICATIONS & OUTBID ALERTS ─────────────────────────────
    printHeader('Test 5: Notification Retrieval & Real-Time Creation');

    // Check Seller notifications: should have notifications for bids placed
    const sellerNotifRes = await apiRequest('/notifications', {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    assert(sellerNotifRes.status === 200, 'Seller fetched notifications (200)');
    assert(sellerNotifRes.data.count > 0, 'Seller has notifications');
    assert(
      sellerNotifRes.data.data[0].message.includes('New bid'),
      'Seller received new bid notification'
    );
    assert(
      sellerNotifRes.data.data[0].relatedAuction.title === 'Premium Antique Watch',
      'Seller notification populated relatedAuction details'
    );

    // Check Buyer 1 notifications: should have received outbid notification from Buyer 2
    const buyer1NotifRes = await apiRequest('/notifications', {
      headers: { Authorization: `Bearer ${buyer1Token}` },
    });
    assert(buyer1NotifRes.data.count > 0, 'Buyer 1 has notifications');
    const outbidNotif = buyer1NotifRes.data.data.find(n => n.message.includes('outbid'));
    assert(outbidNotif !== undefined, 'Buyer 1 received outbid notification');
    notificationId = buyer1NotifRes.data.data[0]._id;

    // ─── TEST 6: MARK NOTIFICATION READ & PROTECTION ────────────────────────
    printHeader('Test 6: Mark Notifications as Read & Access Guard');

    // Attempt to mark Buyer 1's notification as read using Buyer 2's token (should fail)
    const readFailRes = await apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${buyer2Token}` },
    });
    assert(readFailRes.status === 403, 'Marking another user\'s notification read returns 403 Forbidden');

    // Mark single notification read (as Buyer 1)
    const readSuccessRes = await apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${buyer1Token}` },
    });
    assert(readSuccessRes.status === 200, 'Buyer 1 marked notification read successfully (200)');
    assert(readSuccessRes.data.data.isRead === true, 'Notification isRead is true');

    // Mark all as read (as Buyer 1)
    const readAllRes = await apiRequest('/notifications/read-all', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${buyer1Token}` },
    });
    assert(readAllRes.status === 200, 'Buyer 1 marked all read successfully (200)');

    // ─── TEST 7: AUTO-CLOSE EXPIRED AUCTIONS & WINNER DECLARATION ────────────
    printHeader('Test 7: Expired Auction Auto-Closure & Win Notifications');

    // We will bypass date validators by directly inserting an expired auction in the DB
    const AuctionModel = require('./models/Auction');
    const expiredAuction = new AuctionModel({
      title: 'Retro Gaming Console',
      description: 'Used vintage console, tested and working.',
      startPrice: 50,
      currentPrice: 75,
      seller: sellerId,
      endDate: new Date(Date.now() - 5000), // Expired 5 seconds ago
      status: 'active',
      totalBids: 1,
    });
    await expiredAuction.save({ validateBeforeSave: false });
    expiredAuctionId = expiredAuction._id;

    // Create a bid for this expired auction
    const BidModel = require('./models/Bid');
    await BidModel.create({
      auction: expiredAuctionId,
      bidder: buyer1Id,
      amount: 75,
    });

    console.log('⏰ Triggering closeExpiredAuctions Cron task manually...');
    await closeExpiredAuctions();

    // Verify auction closed and winner assigned
    const checkClosedRes = await apiRequest(`/auctions/${expiredAuctionId}`);
    assert(checkClosedRes.data.data.status === 'closed', 'Auction status is updated to closed');
    assert(
      checkClosedRes.data.data.winner.toString() === buyer1Id.toString(),
      'Winner is set to the highest bidder (Buyer 1)'
    );

    // Verify notifications created
    const winnerNotifRes = await apiRequest('/notifications', {
      headers: { Authorization: `Bearer ${buyer1Token}` },
    });
    const winNotif = winnerNotifRes.data.data.find(n => n.type === 'winner_declared');
    assert(winNotif !== undefined, 'Winner received winner declared notification');
    assert(winNotif.message.includes('Congratulations'), 'Winner notification contains correct message');

    const closedSellerNotifRes = await apiRequest('/notifications', {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    const endNotif = closedSellerNotifRes.data.data.find(
      n => n.type === 'auction_ended' && n.relatedAuction._id.toString() === expiredAuctionId.toString()
    );
    assert(endNotif !== undefined, 'Seller received auction ended notification');

    // ─── TEST 8: ADMIN REPORTS ───────────────────────────────────────────────
    printHeader('Test 8: Admin Reports & Access Guard');

    // Access stats with non-admin token (should fail)
    const reportFailRes = await apiRequest('/admin/reports', {
      headers: { Authorization: `Bearer ${buyer1Token}` },
    });
    assert(reportFailRes.status === 403, 'Normal user accessing admin stats gets 403 Forbidden');

    // Access stats with admin token (should succeed)
    const reportsRes = await apiRequest('/admin/reports', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(reportsRes.status === 200, 'Admin reports fetched successfully (200)');
    
    // Revenue calculations: 5% of closed auctions with bids
    // We closed 1 auction (Retro Gaming Console) with bid amount 75. 5% of 75 = 3.75
    assert(
      reportsRes.data.data.financials.totalAuctionValue === 75,
      'Total Closed Auction value calculated correctly ($75)'
    );
    assert(
      reportsRes.data.data.financials.totalRevenue === 3.75,
      'Total Platform revenue calculates correctly ($3.75)'
    );
    assert(
      reportsRes.data.data.auctions.closed === 1,
      'Closed auctions count is correct (1)'
    );

    // Fetch monthly report
    const monthlyRes = await apiRequest('/admin/reports/monthly', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(monthlyRes.status === 200, 'Admin monthly report fetched (200)');
    assert(Array.isArray(monthlyRes.data.data), 'Monthly report is an array');
    assert(monthlyRes.data.data.length === 12, 'Monthly report has 12 items (Jan-Dec)');

    // ─── TEST 8.5: RAZORPAY PAYMENT SIMULATION ───────────────────────────────
    printHeader('Test 8.5: Razorpay Payment Simulation');

    // Create payment order for the closed expired auction
    const createOrderRes = await apiRequest('/payments/order', {
      method: 'POST',
      headers: { Authorization: `Bearer ${buyer1Token}` },
      body: JSON.stringify({ auctionId: expiredAuctionId }),
    });
    assert(createOrderRes.status === 200, 'Payment order created successfully (200)');
    
    const isMock = createOrderRes.data.mock;
    const orderId = createOrderRes.data.order_id;

    if (isMock) {
      assert(orderId.startsWith('order_mock_'), 'Mock order ID format is valid');

      // Verify mock payment
      const verifyPaymentRes = await apiRequest('/payments/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${buyer1Token}` },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: 'pay_mock_test12345',
        }),
      });
      assert(verifyPaymentRes.status === 200, 'Mock payment verified successfully (200)');
      assert(verifyPaymentRes.data.success === true, 'Payment verify response is success');
      assert(verifyPaymentRes.data.paymentStatus === 'paid', 'Auction payment status updated to paid');

      // Double check auction payment state in database
      const checkPaidAuctionRes = await apiRequest(`/auctions/${expiredAuctionId}`);
      assert(checkPaidAuctionRes.data.data.paymentStatus === 'paid', 'Auction is marked as paid in DB');
      assert(checkPaidAuctionRes.data.data.razorpayPaymentId === 'pay_mock_test12345', 'Payment ID matches verified mock payment ID');
    } else {
      assert(orderId.startsWith('order_'), 'Real order ID format is valid');

      // Verify failure on invalid signature to test logic branch
      const verifyFailRes = await apiRequest('/payments/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${buyer1Token}` },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: 'pay_test_12345',
          razorpay_signature: 'invalid_signature_string',
        }),
      });
      assert(verifyFailRes.status === 400, 'Signature verification with invalid signature fails (400)');
      assert(verifyFailRes.data.success === false, 'Verification success is false');
    }

    // ─── TEST 9: EMPTY DATABASE ROBUSTNESS ───────────────────────────────────
    printHeader('Test 9: Empty DB Handling');

    console.log('🧹 Clearing all collections except admin user...');
    await AuctionModel.deleteMany({});
    await BidModel.deleteMany({});
    const NotificationModel = require('./models/Notification');
    await NotificationModel.deleteMany({});
    await mongoose.model('User').deleteMany({ role: { $ne: 'admin' } });

    // Fetch admin report on empty db
    const reportsEmptyRes = await apiRequest('/admin/reports', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(reportsEmptyRes.status === 200, 'Stats fetch on empty DB returned 200');
    assert(reportsEmptyRes.data.data.users.buyers === 0, 'Buyers count is 0');
    assert(reportsEmptyRes.data.data.users.sellers === 0, 'Sellers count is 0');
    assert(reportsEmptyRes.data.data.auctions.total === 0, 'Total auctions count is 0');
    assert(reportsEmptyRes.data.data.financials.totalAuctionValue === 0, 'Revenue calculations handled gracefully (0)');

    printHeader('Test Run Results Summary');
    console.log(`🏆 ALL TESTS COMPLETED SUCCESSFULLY!`);
    console.log(`📊 Result: ${testPassedCount} / ${testTotalCount} assertions passed.`);
    
    // Success, exit clean
    process.exit(0);

  } catch (error) {
    console.error(`\n❌ TEST FAILURE: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

runTests();
