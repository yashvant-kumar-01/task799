// ============================================
// controllers/auctionController.js - Auction Logic
// Task 799 - MERN Auction Platform
// ============================================

const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const CustomError = require('../utils/customError');

// @desc    Create new auction
// @route   POST /api/auctions
// @access  Private (Seller/Admin)
const createAuction = asyncHandler(async (req, res, next) => {
  req.body.seller = req.user.id; // Assign logged-in user as seller

  const auction = await Auction.create(req.body);

  res.status(201).json({
    success: true,
    data: auction,
  });
});

// @desc    Get all auctions
// @route   GET /api/auctions
// @access  Public
const getAuctions = asyncHandler(async (req, res, next) => {
  // Auto-close expired auctions first to ensure data is fresh!
  await closeExpiredAuctions();

  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  // Finding resource
  query = Auction.find(JSON.parse(queryStr)).populate({
    path: 'seller',
    select: 'name avatar',
  });

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt'); // Default sort by newest
  }

  // Executing query
  const auctions = await query;

  res.status(200).json({
    success: true,
    count: auctions.length,
    data: auctions,
  });
});

// @desc    Get single auction
// @route   GET /api/auctions/:id
// @access  Public
const getAuction = asyncHandler(async (req, res, next) => {
  // Auto-close expired auctions first to ensure data is fresh!
  await closeExpiredAuctions();

  const auction = await Auction.findById(req.params.id)
    .populate({
      path: 'seller',
      select: 'name email avatar',
    })
    .populate({
      path: 'bids',
      populate: { path: 'bidder', select: 'name avatar' },
      options: { sort: { amount: -1 } }, // Highest bid first
    });

  if (!auction) {
    throw new CustomError(`No auction found with id of ${req.params.id}`, 404);
  }

  res.status(200).json({
    success: true,
    data: auction,
  });
});

// @desc    Update auction
// @route   PUT /api/auctions/:id
// @access  Private (Seller/Admin)
const updateAuction = asyncHandler(async (req, res, next) => {
  let auction = await Auction.findById(req.params.id);

  if (!auction) {
    throw new CustomError(`No auction found with id of ${req.params.id}`, 404);
  }

  // Make sure user is auction owner or admin
  if (auction.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new CustomError(`User not authorized to update this auction`, 403);
  }

  // Prevent updating if already active with bids
  if (auction.totalBids > 0 && req.body.startPrice) {
    throw new CustomError('Cannot change start price after bids have been placed', 400);
  }

  auction = await Auction.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: auction,
  });
});

// @desc    Delete auction
// @route   DELETE /api/auctions/:id
// @access  Private (Seller/Admin)
const deleteAuction = asyncHandler(async (req, res, next) => {
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    throw new CustomError(`No auction found with id of ${req.params.id}`, 404);
  }

  // Make sure user is auction owner or admin
  if (auction.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new CustomError(`User not authorized to delete this auction`, 403);
  }

  // Prevent deleting if already has bids (unless admin)
  if (auction.totalBids > 0 && req.user.role !== 'admin') {
    throw new CustomError('Cannot delete auction with active bids. Contact Admin.', 400);
  }

  // Also delete associated bids and notifications
  await Bid.deleteMany({ auction: req.params.id });
  await Notification.deleteMany({ relatedAuction: req.params.id });

  await auction.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Place a bid
// @route   POST /api/auctions/:id/bids
// @access  Private (User)
const placeBid = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;
  const auctionId = req.params.id;

  const auction = await Auction.findById(auctionId);

  if (!auction) {
    throw new CustomError('Auction not found', 404);
  }

  // Check if auction is active
  if (auction.status !== 'active') {
    throw new CustomError(`Cannot bid on a ${auction.status} auction`, 400);
  }

  // Check if auction ended
  if (new Date() > new Date(auction.endDate)) {
    throw new CustomError('This auction has already ended', 400);
  }

  // Check if user is the seller
  if (auction.seller.toString() === req.user.id) {
    throw new CustomError('You cannot bid on your own auction', 400);
  }

  // Validate bid amount
  if (amount <= auction.currentPrice) {
    throw new CustomError(`Bid must be higher than current price of $${auction.currentPrice}`, 400);
  }

  // Create bid
  const bid = await Bid.create({
    auction: auctionId,
    bidder: req.user.id,
    amount,
  });

  // Get previous highest bidder to send notification
  const previousHighestBid = await Bid.findOne({ auction: auctionId })
    .sort({ amount: -1 })
    .skip(1); // skip the one we just created

  // Update auction
  auction.currentPrice = amount;
  auction.totalBids += 1;
  await auction.save();

  // Send Notifications
  // 1. To the seller
  await Notification.create({
    user: auction.seller,
    message: `New bid of $${amount} placed on your auction "${auction.title}"`,
    type: 'bid_placed',
    relatedAuction: auctionId,
  });

  // 2. To the previous highest bidder (Outbid notification)
  if (previousHighestBid && previousHighestBid.bidder.toString() !== req.user.id) {
    await Notification.create({
      user: previousHighestBid.bidder,
      message: `You have been outbid on "${auction.title}". Current price is $${amount}.`,
      type: 'bid_placed',
      relatedAuction: auctionId,
    });
  }

  res.status(201).json({
    success: true,
    data: bid,
    message: 'Bid placed successfully',
  });
});

// @desc    Get auctions won by the logged-in buyer
// @route   GET /api/auctions/won
// @access  Private (buyer)
const getWonAuctions = asyncHandler(async (req, res, next) => {
  // Auto-close expired auctions first to ensure data is fresh!
  await closeExpiredAuctions();

  const auctions = await Auction.find({
    winner: req.user.id,
    status: 'closed',
  })
  .populate('seller', 'name email')
  .sort('-updatedAt');

  res.status(200).json({
    success: true,
    count: auctions.length,
    data: auctions,
  });
});

// @desc    Get highest bid for an auction
// @route   GET /api/auctions/:id/highest-bid
// @access  Public
const getHighestBid = asyncHandler(async (req, res, next) => {
  const bid = await Bid.findOne({ auction: req.params.id })
    .sort({ amount: -1 })
    .populate('bidder', 'name avatar');

  if (!bid) {
    return res.status(200).json({
      success: true,
      data: null,
      message: 'No bids yet',
    });
  }

  res.status(200).json({
    success: true,
    data: bid,
  });
});

// @desc    Auto-close expired auctions (Called by Cron Job)
const closeExpiredAuctions = async () => {
  try {
    const now = new Date();
    // Find active auctions where endDate has passed
    const expiredAuctions = await Auction.find({
      status: 'active',
      endDate: { $lt: now },
    });

    for (const auction of expiredAuctions) {
      // Find highest bid
      const highestBid = await Bid.findOne({ auction: auction._id }).sort({ amount: -1 });

      let winnerId = null;
      if (highestBid) {
        winnerId = highestBid.bidder;
        auction.winner = winnerId;
      }

      auction.status = 'closed';
      await auction.save();

      // Notifications
      // To seller
      await Notification.create({
        user: auction.seller,
        message: `Your auction "${auction.title}" has ended. ${winnerId ? 'It was won by a bidder.' : 'No bids were placed.'}`,
        type: 'auction_ended',
        relatedAuction: auction._id,
      });

      // To winner
      if (winnerId) {
        await Notification.create({
          user: winnerId,
          message: `Congratulations! You won the auction for "${auction.title}" with a bid of $${highestBid.amount}.`,
          type: 'winner_declared',
          relatedAuction: auction._id,
        });
      }
    }
    if(expiredAuctions.length > 0) {
        console.log(`[Cron] Closed ${expiredAuctions.length} expired auctions.`);
    }
  } catch (error) {
    console.error(`[Cron Error] Failed to close expired auctions: ${error.message}`);
  }
};

module.exports = {
  createAuction,
  getAuctions,
  getAuction,
  updateAuction,
  deleteAuction,
  placeBid,
  getHighestBid,
  getWonAuctions,
  closeExpiredAuctions,
};
