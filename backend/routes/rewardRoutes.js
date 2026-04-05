const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get current user's reward status
router.get('/status', rewardController.getRewardStatus);

// Redeem points for free book
router.post('/redeem-free-book', rewardController.redeemFreeBook);

// Get transaction history
router.get('/transactions', rewardController.getTransactionHistory);

// Check if user has active free book rewards
router.get('/check-free-book', rewardController.checkActiveFreeBook);

module.exports = router;
