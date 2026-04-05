import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId,
        page: page.toString(),
        limit: '20'
      });

      if (filter === 'unread') {
        params.append('unreadOnly', 'true');
      }

      const response = await axios.get(
        `http://localhost:5001/api/notifications?${params.toString()}`
      );

      if (response.data.success) {
        setNotifications(response.data.notifications);
        setTotalPages(response.data.pagination.pages);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:5001/api/notifications/${notificationId}/read`,
        { userId }
      );

      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put(
        'http://localhost:5001/api/notifications/read-all',
        { userId }
      );

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(
        `http://localhost:5001/api/notifications/${notificationId}`,
        { data: { userId } }
      );

      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Delete all read notifications
  const deleteAllRead = async () => {
    if (!window.confirm('Are you sure you want to delete all read notifications?')) {
      return;
    }

    try {
      await axios.delete(
        'http://localhost:5001/api/notifications/read/all',
        { data: { userId } }
      );

      setNotifications(prev => prev.filter(notif => !notif.isRead));
    } catch (error) {
      console.error('Error deleting read notifications:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  // Fetch notifications on mount and when filter/page changes
  useEffect(() => {
    fetchNotifications();
  }, [filter, page]);

  // Get time ago string
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return new Date(date).toLocaleDateString();
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'rental_created':
        return '📚';
      case 'rental_expiring_soon':
        return '⚠️';
      case 'rental_overdue':
        return '🚨';
      case 'rental_returned':
        return '✅';
      case 'book_available':
        return '📖';
      case 'order_placed':
        return '🛒';
      case 'order_approved':
        return '✅';
      case 'order_cancelled':
        return '❌';
      case 'account_created':
        return '🎉';
      case 'account_updated':
        return '✏️';
      case 'password_reset':
        return '🔐';
      case 'system_announcement':
        return '📢';
      case 'admin_message':
        return '💬';
      default:
        return '📬';
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Urgent</span>;
      case 'high':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">High</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Medium</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Low</span>;
      default:
        return null;
    }
  };

  // Filtered notifications for display
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/catalog" className="flex items-center space-x-2">
              <div className="flex flex-col">
                <div className="w-6 h-6 bg-green-500 rounded-sm mb-0.5"></div>
                <div className="w-6 h-5 bg-orange-500 rounded-sm mb-0.5"></div>
                <div className="w-6 h-4 bg-red-500 rounded-sm"></div>
              </div>
              <span className="text-xl md:text-2xl font-bold text-gray-800">
                Bookify
              </span>
            </Link>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <Link
                to="/catalog"
                className="text-gray-700 hover:text-blue-600 transition font-medium"
              >
                Catalog
              </Link>
              <span className="hidden sm:block text-gray-700 font-medium">
                Hello, {user.fullName || 'User'}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md transition text-sm md:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Filter Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => { setFilter('all'); setPage(1); }}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => { setFilter('unread'); setPage(1); }}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === 'unread'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => { setFilter('read'); setPage(1); }}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === 'read'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Read
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition text-sm"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={deleteAllRead}
                  className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition text-sm"
                >
                  Clear read
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg
                className="w-20 h-20 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No notifications</h3>
              <p className="text-gray-500">
                {filter === 'unread'
                  ? "You don't have any unread notifications"
                  : filter === 'read'
                  ? "You don't have any read notifications"
                  : "You don't have any notifications yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${
                    !notification.isRead ? 'border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      onClick={() => handleNotificationClick(notification)}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-base font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                            {getPriorityBadge(notification.priority)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400">
                            {getTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Mark as read"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => setPage(idx + 1)}
                    className={`px-3 py-2 rounded-lg font-medium ${
                      page === idx + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
