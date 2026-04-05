const User = require('../models/User');
const Order = require('../models/Order');
const Rental = require('../models/Rental');
const Book = require('../models/Book');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create a new user (by admin)
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      role: role || 'user',
      agreedToTerms: true // Admin created users are automatically agreed
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { fullName, email, role, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from changing their own role or deactivating themselves
    if (user._id.toString() === req.user.id && (role || isActive === false)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role or deactivate your account'
      });
    }

    if (fullName) user.fullName = fullName;
    if (email) {
      // Check if new email is already taken
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use'
        });
      }
      user.email = email;
    }
    if (role) user.role = role;
    if (typeof isActive !== 'undefined') user.isActive = isActive;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    // Get users registered in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    // Get recent registrations
    const latestUsers = await User.find()
      .select('fullName email role createdAt')
      .sort('-createdAt')
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        adminUsers,
        regularUsers,
        recentUsers,
        latestUsers
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get full dashboard data (stats + charts + recent orders + top books)
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardData = async (req, res) => {
  try {
    const now = new Date();

    // ── Stat counts ───────────────────────────────────────────────────────
    const [totalBooks, totalUsers, activeRentals, overdueRentals] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Rental.countDocuments({ status: 'active' }),
      Rental.countDocuments({ status: 'overdue' }),
    ]);

    // Total revenue: sum of all order totalAmounts
    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // ── Recent 5 orders ───────────────────────────────────────────────────
    const recentOrders = await Order.find()
      .sort('-createdAt')
      .limit(5)
      .populate('user', 'fullName email')
      .populate('items.book', 'title');

    // ── Top 5 books by order count ────────────────────────────────────────
    const topBooksAgg = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.book',
          totalSales: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
      {
        $project: {
          title: '$book.title',
          author: '$book.author',
          totalSales: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // ── Monthly revenue for last 6 months (bar chart) ─────────────────────
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenueAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Fill in zeros for months with no orders
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const found = monthlyRevenueAgg.find(r => r._id.year === y && r._id.month === m);
      monthlyRevenue.push({
        label: `${MONTHS[m - 1]} ${y}`,
        revenue: found?.revenue || 0,
        orders: found?.count || 0,
      });
    }

    // ── Order type breakdown (doughnut chart) ─────────────────────────────
    const orderTypeAgg = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.type', count: { $sum: 1 } } },
    ]);
    const orderTypeBreakdown = {
      purchase: orderTypeAgg.find(x => x._id === 'purchase')?.count || 0,
      rental:   orderTypeAgg.find(x => x._id === 'rental')?.count || 0,
    };

    // ── Order status breakdown ─────────────────────────────────────────────
    const statusAgg = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const orderStatusBreakdown = {};
    statusAgg.forEach(s => { orderStatusBreakdown[s._id] = s.count; });

    res.status(200).json({
      success: true,
      stats: { totalBooks, totalUsers, activeRentals, overdueRentals, totalRevenue },
      recentOrders,
      topBooks: topBooksAgg,
      monthlyRevenue,
      orderTypeBreakdown,
      orderStatusBreakdown,
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Clear all orders and rentals (ADMIN ONLY - USE WITH CAUTION)
// @route   DELETE /api/admin/clear-all-data
// @access  Private/Admin
exports.clearAllData = async (req, res) => {
  try {
    // Delete all orders
    const ordersDeleted = await Order.deleteMany({});
    
    // Delete all rentals
    const rentalsDeleted = await Rental.deleteMany({});

    console.log(`🗑️ Cleared ${ordersDeleted.deletedCount} orders and ${rentalsDeleted.deletedCount} rentals`);

    res.status(200).json({
      success: true,
      message: 'All orders and rentals cleared successfully',
      data: {
        ordersDeleted: ordersDeleted.deletedCount,
        rentalsDeleted: rentalsDeleted.deletedCount
      }
    });
  } catch (error) {
    console.error('Clear all data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
