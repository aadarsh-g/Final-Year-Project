const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    // User who owns these rewards
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },

    // Current points balance
    points: {
      type: Number,
      default: 0,
      min: 0
    },

    // Total points earned all time
    totalPointsEarned: {
      type: Number,
      default: 0,
      min: 0
    },

    // Total points redeemed all time
    totalPointsRedeemed: {
      type: Number,
      default: 0,
      min: 0
    },

    // Active free book rewards (unused)
    activeFreeBookRewards: {
      type: Number,
      default: 0,
      min: 0
    },

    // Total free books redeemed all time
    totalFreeBookRedeemed: {
      type: Number,
      default: 0,
      min: 0
    },

    // Points transaction history
    transactions: [
      {
        type: {
          type: String,
          enum: ['earned', 'redeemed', 'expired', 'adjusted'],
          required: true
        },
        points: {
          type: Number,
          required: true
        },
        reason: {
          type: String,
          required: true
        },
        relatedOrder: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order'
        },
        relatedRental: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Rental'
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        balanceAfter: {
          type: Number,
          required: true
        }
      }
    ],

    // Free book redemption history
    redemptions: [
      {
        redeemedAt: {
          type: Date,
          default: Date.now
        },
        pointsDeducted: {
          type: Number,
          required: true
        },
        usedAt: {
          type: Date
        },
        usedInOrder: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order'
        },
        bookReceived: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book'
        },
        status: {
          type: String,
          enum: ['active', 'used', 'expired'],
          default: 'active'
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
rewardSchema.index({ userId: 1 });
rewardSchema.index({ 'transactions.timestamp': -1 });
rewardSchema.index({ 'redemptions.status': 1 });

// Method to add points
rewardSchema.methods.addPoints = function(points, reason, relatedId, relatedType) {
  this.points += points;
  this.totalPointsEarned += points;
  
  const transaction = {
    type: 'earned',
    points: points,
    reason: reason,
    balanceAfter: this.points,
    timestamp: new Date()
  };

  if (relatedType === 'order') {
    transaction.relatedOrder = relatedId;
  } else if (relatedType === 'rental') {
    transaction.relatedRental = relatedId;
  }

  this.transactions.push(transaction);
  return this.save();
};

// Method to redeem points for free book
rewardSchema.methods.redeemFreeBook = function(pointsRequired = 200) {
  if (this.points < pointsRequired) {
    throw new Error('Insufficient points to redeem free book');
  }

  this.points -= pointsRequired;
  this.totalPointsRedeemed += pointsRequired;
  this.activeFreeBookRewards += 1;

  this.transactions.push({
    type: 'redeemed',
    points: -pointsRequired,
    reason: 'Redeemed free book reward',
    balanceAfter: this.points,
    timestamp: new Date()
  });

  this.redemptions.push({
    redeemedAt: new Date(),
    pointsDeducted: pointsRequired,
    status: 'active'
  });

  return this.save();
};

// Method to use a free book reward
rewardSchema.methods.useFreeBook = function(orderId, bookId) {
  if (this.activeFreeBookRewards <= 0) {
    throw new Error('No active free book rewards available');
  }

  // Find the oldest active redemption
  const activeRedemption = this.redemptions.find(r => r.status === 'active');
  if (!activeRedemption) {
    throw new Error('No active redemption found');
  }

  activeRedemption.status = 'used';
  activeRedemption.usedAt = new Date();
  activeRedemption.usedInOrder = orderId;
  activeRedemption.bookReceived = bookId;

  this.activeFreeBookRewards -= 1;
  this.totalFreeBookRedeemed += 1;

  return this.save();
};

const Reward = mongoose.model('Reward', rewardSchema);

module.exports = Reward;
