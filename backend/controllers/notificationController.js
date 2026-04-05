const NotificationService = require('../services/notificationService');

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      unreadOnly: req.query.unreadOnly === 'true',
      type: req.query.type || null
    };

    const result = await NotificationService.getUserNotifications(userId, options);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const count = await NotificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const notificationId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const notification = await NotificationService.markAsRead(notificationId, userId);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    await NotificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const notificationId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    await NotificationService.deleteNotification(notificationId, userId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete notification',
      error: error.message
    });
  }
};

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/read
// @access  Private
exports.deleteAllRead = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const result = await NotificationService.deleteAllRead(userId);

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} read notifications`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete all read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete read notifications',
      error: error.message
    });
  }
};

// @desc    Create system announcement (Admin only)
// @route   POST /api/notifications/announcement
// @access  Private/Admin
exports.createAnnouncement = async (req, res) => {
  try {
    // Check if user is admin
    const userRole = req.user?.role || req.body.adminRole;
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create announcements'
      });
    }

    const { title, message, priority, actionUrl, expiresAt } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    const notifications = await NotificationService.createAnnouncement({
      title,
      message,
      priority,
      actionUrl,
      expiresAt
    });

    res.status(201).json({
      success: true,
      message: `Announcement sent to ${notifications.length} users`,
      count: notifications.length
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create announcement',
      error: error.message
    });
  }
};

// @desc    Send admin message to user (Admin only)
// @route   POST /api/notifications/admin-message
// @access  Private/Admin
exports.sendAdminMessage = async (req, res) => {
  try {
    // Check if user is admin
    const userRole = req.user?.role || req.body.adminRole;
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can send messages'
      });
    }

    const { userId, title, message, priority, actionUrl } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        message: 'User ID and message are required'
      });
    }

    const notification = await NotificationService.sendAdminMessage(userId, {
      title,
      message,
      priority,
      actionUrl
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      notification
    });
  } catch (error) {
    console.error('Send admin message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// @desc    Test notification creation (for development)
// @route   POST /api/notifications/test
// @access  Private
exports.createTestNotification = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const notification = await NotificationService.createNotification({
      userId,
      type: 'system_announcement',
      title: '🧪 Test Notification',
      message: 'This is a test notification created at ' + new Date().toLocaleString(),
      priority: 'low'
    });

    res.status(201).json({
      success: true,
      message: 'Test notification created',
      notification
    });
  } catch (error) {
    console.error('Create test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test notification',
      error: error.message
    });
  }
};
