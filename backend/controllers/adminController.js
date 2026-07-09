// ============================================
// controllers/adminController.js - Admin Reports
// Task 799 - MERN Auction Platform
// ============================================

const User = require('../models/User');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard reports/stats
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getReports = asyncHandler(async (req, res, next) => {
  // Aggregate stats
  const totalUsers = await User.countDocuments({ role: 'user' });
  const totalSellers = await User.countDocuments({ role: 'seller' });
  const totalAdmins = await User.countDocuments({ role: 'admin' });
  
  const totalAuctions = await Auction.countDocuments();
  const activeAuctions = await Auction.countDocuments({ status: 'active' });
  const closedAuctions = await Auction.countDocuments({ status: 'closed' });
  
  const totalBids = await Bid.countDocuments();

  // Calculate Total Revenue (Platform fee logic could be here, simply sum of winning bids for now)
  // Revenue is just a placeholder example based on 5% of closed auction current prices
  const closedAuctionsList = await Auction.find({ status: 'closed', totalBids: { $gt: 0 } });
  
  const totalAuctionValue = closedAuctionsList.reduce((acc, auction) => acc + auction.currentPrice, 0);
  const totalRevenue = totalAuctionValue * 0.05; // 5% fee example

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers + totalSellers + totalAdmins,
        buyers: totalUsers,
        sellers: totalSellers,
        admins: totalAdmins
      },
      auctions: {
        total: totalAuctions,
        active: activeAuctions,
        closed: closedAuctions
      },
      bids: {
        total: totalBids
      },
      financials: {
        totalAuctionValue,
        totalRevenue
      }
    },
  });
});

// @desc    Get monthly registration report
// @route   GET /api/admin/reports/monthly
// @access  Private (Admin)
const getMonthlyReport = asyncHandler(async (req, res, next) => {
  const currentYear = new Date().getFullYear();

  // MongoDB Aggregation for Users created per month this year
  const userStats = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id": 1 }
    }
  ]);

  // MongoDB Aggregation for Auctions created per month this year
  const auctionStats = await Auction.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id": 1 }
    }
  ]);

  // Format data for frontend charting (e.g. ['Jan', 'Feb', ...])
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const formattedData = months.map((month, index) => {
    const monthNum = index + 1;
    const userStat = userStats.find(s => s._id === monthNum);
    const auctionStat = auctionStats.find(s => s._id === monthNum);

    return {
      name: month,
      users: userStat ? userStat.count : 0,
      auctions: auctionStat ? auctionStat.count : 0
    };
  });

  res.status(200).json({
    success: true,
    data: formattedData
  });
});

module.exports = {
  getReports,
  getMonthlyReport
};
