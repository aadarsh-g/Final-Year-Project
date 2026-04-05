const rewardService = require('../services/rewardService');

/**
 * Get current user's reward status
 */
exports.getRewardStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const status = await rewardService.getUserRewardStatus(userId);
    
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting reward status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reward status',
      error: error.message
    });
  }
};

/**
 * Redeem points for a free book
 */
exports.redeemFreeBook = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await rewardService.redeemFreeBook(userId);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        pointsRemaining: result.pointsRemaining,
        activeFreeBookRewards: result.activeFreeBookRewards
      }
    });
  } catch (error) {
    console.error('Error redeeming free book:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to redeem free book'
    });
  }
};

/**
 * Get transaction history
 */
exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 50;
    
    const transactions = await rewardService.getTransactionHistory(userId, limit);
    
    res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error getting transaction history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction history',
      error: error.message
    });
  }
};

/**
 * Check if user has active free book rewards
 */
exports.checkActiveFreeBook = async (req, res) => {
  try {
    const userId = req.user._id;
    const hasActiveReward = await rewardService.hasActiveFreeBookReward(userId);
    
    res.status(200).json({
      success: true,
      data: {
        hasActiveFreeBookReward: hasActiveReward
      }
    });
  } catch (error) {
    console.error('Error checking active free book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check active free book reward',
      error: error.message
    });
  }
};
