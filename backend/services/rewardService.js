const Reward = require('../models/Reward');
const User = require('../models/User');

class RewardService {
  /**
   * Get or create reward record for a user
   * @param {String} userId - User ID
   * @returns {Promise<Reward>}
   */
  static async getOrCreateReward(userId) {
    try {
      let reward = await Reward.findOne({ userId });
      
      if (!reward) {
        reward = await Reward.create({
          userId,
          points: 0,
          totalPointsEarned: 0,
          totalPointsRedeemed: 0,
          activeFreeBookRewards: 0,
          totalFreeBookRedeemed: 0,
          transactions: [],
          redemptions: []
        });
      }
      
      return reward;
    } catch (error) {
      console.error('Error getting/creating reward:', error);
      throw error;
    }
  }

  /**
   * Award points for a book purchase
   * @param {String} userId - User ID
   * @param {String} orderId - Order ID
   * @param {Number} bookCount - Number of books purchased
   * @returns {Promise<Reward>}
   */
  static async awardPointsForPurchase(userId, orderId, bookCount = 1) {
    try {
      const reward = await this.getOrCreateReward(userId);
      const pointsPerBook = 10;
      const totalPoints = pointsPerBook * bookCount;
      
      await reward.addPoints(
        totalPoints,
        `Earned ${totalPoints} points from purchasing ${bookCount} book(s)`,
        orderId,
        'order'
      );
      
      console.log(`✅ Awarded ${totalPoints} points to user ${userId} for purchase`);
      return reward;
    } catch (error) {
      console.error('Error awarding purchase points:', error);
      throw error;
    }
  }

  /**
   * Award points for a book rental
   * @param {String} userId - User ID
   * @param {String} rentalId - Rental ID
   * @param {Number} bookCount - Number of books rented
   * @returns {Promise<Reward>}
   */
  static async awardPointsForRental(userId, rentalId, bookCount = 1) {
    try {
      const reward = await this.getOrCreateReward(userId);
      const pointsPerBook = 5;
      const totalPoints = pointsPerBook * bookCount;
      
      await reward.addPoints(
        totalPoints,
        `Earned ${totalPoints} points from renting ${bookCount} book(s)`,
        rentalId,
        'rental'
      );
      
      console.log(`✅ Awarded ${totalPoints} points to user ${userId} for rental`);
      return reward;
    } catch (error) {
      console.error('Error awarding rental points:', error);
      throw error;
    }
  }

  /**
   * Get user's current reward status
   * @param {String} userId - User ID
   * @returns {Promise<Object>}
   */
  static async getUserRewardStatus(userId) {
    try {
      const reward = await this.getOrCreateReward(userId);
      
      return {
        points: reward.points,
        totalPointsEarned: reward.totalPointsEarned,
        totalPointsRedeemed: reward.totalPointsRedeemed,
        activeFreeBookRewards: reward.activeFreeBookRewards,
        totalFreeBookRedeemed: reward.totalFreeBookRedeemed,
        canRedeemFreeBook: reward.points >= 200,
        pointsNeededForFreeBook: Math.max(0, 200 - reward.points),
        recentTransactions: reward.transactions.slice(-10).reverse() // Last 10 transactions
      };
    } catch (error) {
      console.error('Error getting reward status:', error);
      throw error;
    }
  }

  /**
   * Redeem points for a free book
   * @param {String} userId - User ID
   * @returns {Promise<Object>}
   */
  static async redeemFreeBook(userId) {
    try {
      const reward = await this.getOrCreateReward(userId);
      
      if (reward.points < 200) {
        throw new Error(`Insufficient points. You have ${reward.points} points, need 200 points.`);
      }
      
      await reward.redeemFreeBook(200);
      
      console.log(`✅ User ${userId} redeemed free book reward (200 points deducted)`);
      
      return {
        success: true,
        message: 'Free book reward activated! You can now select one free book during checkout.',
        pointsRemaining: reward.points,
        activeFreeBookRewards: reward.activeFreeBookRewards
      };
    } catch (error) {
      console.error('Error redeeming free book:', error);
      throw error;
    }
  }

  /**
   * Use a free book reward during checkout
   * @param {String} userId - User ID
   * @param {String} orderId - Order ID
   * @param {String} bookId - Book ID
   * @returns {Promise<Object>}
   */
  static async useFreeBookReward(userId, orderId, bookId) {
    try {
      const reward = await this.getOrCreateReward(userId);
      
      if (reward.activeFreeBookRewards <= 0) {
        throw new Error('No active free book rewards available');
      }
      
      await reward.useFreeBook(orderId, bookId);
      
      console.log(`✅ User ${userId} used free book reward for book ${bookId} in order ${orderId}`);
      
      return {
        success: true,
        message: 'Free book reward applied successfully!',
        activeFreeBookRewards: reward.activeFreeBookRewards
      };
    } catch (error) {
      console.error('Error using free book reward:', error);
      throw error;
    }
  }

  /**
   * Check if user has active free book rewards
   * @param {String} userId - User ID
   * @returns {Promise<Boolean>}
   */
  static async hasActiveFreeBookReward(userId) {
    try {
      const reward = await this.getOrCreateReward(userId);
      return reward.activeFreeBookRewards > 0;
    } catch (error) {
      console.error('Error checking free book reward:', error);
      return false;
    }
  }

  /**
   * Get user's transaction history
   * @param {String} userId - User ID
   * @param {Number} limit - Number of transactions to return
   * @returns {Promise<Array>}
   */
  static async getTransactionHistory(userId, limit = 50) {
    try {
      const reward = await this.getOrCreateReward(userId);
      return reward.transactions
        .slice(-limit)
        .reverse()
        .map(t => ({
          type: t.type,
          points: t.points,
          reason: t.reason,
          timestamp: t.timestamp,
          balanceAfter: t.balanceAfter
        }));
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }
}

module.exports = RewardService;
