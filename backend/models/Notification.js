const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Recipient of the notification
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // Type of notification
    type: {
      type: String,
      enum: [
        'rental_created',
        'rental_expiring_soon',
        'rental_overdue',
        'rental_returned',
        'book_available',
        'order_placed',
        'order_approved',
        'order_cancelled',
        'account_created',
        'account_updated',
        'password_reset',
        'system_announcement',
        'admin_message'
      ],
      required: true
    },

    // Notification title
    title: {
      type: String,
      required: true,
      trim: true
    },

    // Notification message/body
    message: {
      type: String,
      required: true,
      trim: true
    },

    // Related entities (for navigation)
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['book', 'rental', 'order', 'user', 'none'],
        default: 'none'
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
      }
    },

    // Action URL (optional - for deep linking)
    actionUrl: {
      type: String,
      default: null
    },

    // Priority level
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },

    // Read status
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },

    // Read at timestamp
    readAt: {
      type: Date,
      default: null
    },

    // Email sent flag
    emailSent: {
      type: Boolean,
      default: false
    },

    // For system-wide announcements
    isSystemWide: {
      type: Boolean,
      default: false
    },

    // Expiry date (for temporary notifications)
    expiresAt: {
      type: Date,
      default: null
    },

    // Metadata for additional info
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Virtual for age
notificationSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

// Method to mark as unread
notificationSchema.methods.markAsUnread = async function() {
  this.isRead = false;
  this.readAt = null;
  return await this.save();
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ userId, isRead: false });
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to delete old notifications
notificationSchema.statics.deleteOldNotifications = async function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
