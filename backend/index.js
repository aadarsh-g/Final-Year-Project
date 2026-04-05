require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDatabase = require('./config/database');
const { startScheduler } = require('./jobs/rentalScheduler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookRoutes = require('./routes/bookRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const cartRoutes = require('./routes/cartRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const khaltiRoutes = require('./routes/khaltiRoutes');

const app = express();
const PORT = process.env.PORT || 5001; // Changed from 5000 to 5001

// CORS MUST be first - Allow all origins for development
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDatabase();

// Request logging middleware (for development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Bookify Backend API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/khalti', khaltiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV}`);
  console.log(`\n📍 Available endpoints:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Admin: http://localhost:${PORT}/api/admin`);
  console.log(`   - Notifications: http://localhost:${PORT}/api/notifications`);
  console.log(`   - Cart: http://localhost:${PORT}/api/cart`);
  console.log(`   - Checkout: http://localhost:${PORT}/api/checkout`);
  console.log(`   - Rentals: http://localhost:${PORT}/api/rentals`);
  console.log(`   - Khalti: http://localhost:${PORT}/api/khalti`);
  
  // Test email configuration
  const { testEmailConfig } = require('./services/emailService');
  const emailReady = await testEmailConfig();
  if (emailReady) {
    console.log(`\n📧 Email service: ✅ Ready (${process.env.EMAIL_USER})`);
  } else {
    console.log(`\n⚠️  Email service: ❌ Not configured`);
  }

  // Start background rental scheduler (reminders + fines)
  startScheduler();

  console.log(`\n✨ Ready to accept requests!\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('❌ Unhandled Rejection:', err.message);
  // Close server & exit process
  process.exit(1);
});
