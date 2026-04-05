const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  /**
   * Create a notification
   * @param {Object} data - Notification data
   * @returns {Promise<Notification>}
   */
  static async createNotification(data) {
    try {
      const notification = await Notification.create(data);
      
      // TODO: Implement email sending if enabled
      // if (data.sendEmail) {
      //   await this.sendEmailNotification(notification);
      // }
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create notification for rental created
   */
  static async notifyRentalCreated(userId, rentalData) {
    return await this.createNotification({
      userId,
      type: 'rental_created',
      title: 'Book Rented Successfully',
      message: `You have successfully rented "${rentalData.bookTitle}". Due date: ${new Date(rentalData.dueDate).toLocaleDateString()}`,
      relatedEntity: {
        entityType: 'rental',
        entityId: rentalData.rentalId
      },
      actionUrl: '/orders',
      priority: 'medium',
      metadata: {
        bookId: rentalData.bookId,
        dueDate: rentalData.dueDate
      }
    });
  }

  /**
   * Create notification for rental expiring soon
   */
  static async notifyRentalExpiring(userId, rentalData) {
    return await this.createNotification({
      userId,
      type: 'rental_expiring_soon',
      title: '⚠️ Rental Expiring Soon',
      message: `Your rental of "${rentalData.bookTitle}" is expiring in ${rentalData.daysLeft} day(s). Please return it soon.`,
      relatedEntity: {
        entityType: 'rental',
        entityId: rentalData.rentalId
      },
      actionUrl: '/orders',
      priority: 'high',
      metadata: {
        bookId: rentalData.bookId,
        dueDate: rentalData.dueDate,
        daysLeft: rentalData.daysLeft
      }
    });
  }

  /**
   * Create notification for overdue rental
   */
  static async notifyRentalOverdue(userId, rentalData) {
    return await this.createNotification({
      userId,
      type: 'rental_overdue',
      title: '🚨 Rental Overdue',
      message: `Your rental of "${rentalData.bookTitle}" is overdue by ${rentalData.daysOverdue} day(s). Late fees may apply.`,
      relatedEntity: {
        entityType: 'rental',
        entityId: rentalData.rentalId
      },
      actionUrl: '/orders',
      priority: 'urgent',
      metadata: {
        bookId: rentalData.bookId,
        dueDate: rentalData.dueDate,
        daysOverdue: rentalData.daysOverdue
      }
    });
  }

  /**
   * Create notification for rental returned
   */
  static async notifyRentalReturned(userId, rentalData) {
    return await this.createNotification({
      userId,
      type: 'rental_returned',
      title: '✅ Book Returned',
      message: `Thank you for returning "${rentalData.bookTitle}". ${rentalData.lateFee ? `Late fee: $${rentalData.lateFee}` : 'Returned on time!'}`,
      relatedEntity: {
        entityType: 'rental',
        entityId: rentalData.rentalId
      },
      actionUrl: '/orders',
      priority: 'low',
      metadata: {
        bookId: rentalData.bookId,
        returnedAt: rentalData.returnedAt,
        lateFee: rentalData.lateFee || 0
      }
    });
  }

  /**
   * Create notification for book availability
   */
  static async notifyBookAvailable(userId, bookData) {
    return await this.createNotification({
      userId,
      type: 'book_available',
      title: '📚 Book Now Available',
      message: `Good news! "${bookData.bookTitle}" is now available for rent or purchase.`,
      relatedEntity: {
        entityType: 'book',
        entityId: bookData.bookId
      },
      actionUrl: `/book/${bookData.bookId}`,
      priority: 'medium',
      metadata: {
        bookId: bookData.bookId
      }
    });
  }

  /**
   * Create notification for order placed
   */
  static async notifyOrderPlaced(userId, orderData) {
    return await this.createNotification({
      userId,
      type: 'order_placed',
      title: '🛒 Order Placed',
      message: `Your order #${orderData.orderId} for "${orderData.bookTitle}" has been placed successfully. Total: $${orderData.totalAmount}`,
      relatedEntity: {
        entityType: 'order',
        entityId: orderData.orderId
      },
      actionUrl: '/orders',
      priority: 'medium',
      metadata: {
        orderId: orderData.orderId,
        totalAmount: orderData.totalAmount
      }
    });
  }

  /**
   * Create notification for order approved
   */
  static async notifyOrderApproved(userId, orderData) {
    return await this.createNotification({
      userId,
      type: 'order_approved',
      title: '✅ Order Approved',
      message: `Your order #${orderData.orderId} has been approved and is being processed.`,
      relatedEntity: {
        entityType: 'order',
        entityId: orderData.orderId
      },
      actionUrl: '/orders',
      priority: 'medium',
      metadata: {
        orderId: orderData.orderId
      }
    });
  }

  /**
   * Create notification for order cancelled
   */
  static async notifyOrderCancelled(userId, orderData) {
    return await this.createNotification({
      userId,
      type: 'order_cancelled',
      title: '❌ Order Cancelled',
      message: `Your order #${orderData.orderId} has been cancelled. ${orderData.reason || ''}`,
      relatedEntity: {
        entityType: 'order',
        entityId: orderData.orderId
      },
      actionUrl: '/orders',
      priority: 'high',
      metadata: {
        orderId: orderData.orderId,
        reason: orderData.reason
      }
    });
  }

  /**
   * Create notification for account created
   */
  static async notifyAccountCreated(userId, userData) {
    return await this.createNotification({
      userId,
      type: 'account_created',
      title: '🎉 Welcome to Bookify!',
      message: `Welcome ${userData.fullName}! Your account has been created successfully. Start exploring our collection now.`,
      relatedEntity: {
        entityType: 'user',
        entityId: userId
      },
      actionUrl: '/catalog',
      priority: 'low'
    });
  }

  /**
   * Create notification for account updated
   */
  static async notifyAccountUpdated(userId) {
    return await this.createNotification({
      userId,
      type: 'account_updated',
      title: '✏️ Profile Updated',
      message: 'Your profile information has been updated successfully.',
      relatedEntity: {
        entityType: 'user',
        entityId: userId
      },
      priority: 'low'
    });
  }

  /**
   * Create notification for password reset
   */
  static async notifyPasswordReset(userId) {
    return await this.createNotification({
      userId,
      type: 'password_reset',
      title: '🔐 Password Changed',
      message: 'Your password has been changed successfully. If you did not make this change, please contact support immediately.',
      relatedEntity: {
        entityType: 'user',
        entityId: userId
      },
      priority: 'high'
    });
  }

  /**
   * Create system-wide announcement
   */
  static async createAnnouncement(announcementData) {
    const users = await User.find({ isActive: true }).select('_id');
    
    const notifications = users.map(user => ({
      userId: user._id,
      type: 'system_announcement',
      title: announcementData.title,
      message: announcementData.message,
      priority: announcementData.priority || 'medium',
      isSystemWide: true,
      actionUrl: announcementData.actionUrl || null,
      expiresAt: announcementData.expiresAt || null
    }));

    return await Notification.insertMany(notifications);
  }

  /**
   * Send admin message to specific user
   */
  static async sendAdminMessage(userId, messageData) {
    return await this.createNotification({
      userId,
      type: 'admin_message',
      title: messageData.title || '📢 Message from Admin',
      message: messageData.message,
      priority: messageData.priority || 'high',
      actionUrl: messageData.actionUrl || null
    });
  }

  /**
   * Get notifications for user
   */
  static async getUserNotifications(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      type = null
    } = options;

    const query = { userId };
    
    if (unreadOnly) {
      query.isRead = false;
    }
    
    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(userId);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return await notification.markAsRead();
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId) {
    return await Notification.markAllAsRead(userId);
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId, userId) {
    const result = await Notification.deleteOne({
      _id: notificationId,
      userId
    });

    if (result.deletedCount === 0) {
      throw new Error('Notification not found');
    }

    return result;
  }

  /**
   * Delete all read notifications
   */
  static async deleteAllRead(userId) {
    return await Notification.deleteMany({
      userId,
      isRead: true
    });
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(userId) {
    return await Notification.getUnreadCount(userId);
  }
}

module.exports = NotificationService;
