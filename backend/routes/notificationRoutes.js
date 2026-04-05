const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  createAnnouncement,
  sendAdminMessage,
  createTestNotification
} = require('../controllers/notificationController');

// User routes
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);
router.delete('/read/all', deleteAllRead);

// Admin routes
router.post('/announcement', createAnnouncement);
router.post('/admin-message', sendAdminMessage);

// Test route (can be removed in production)
router.post('/test', createTestNotification);

module.exports = router;
