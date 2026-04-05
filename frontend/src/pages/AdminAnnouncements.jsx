import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminAnnouncements = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'medium',
    actionUrl: '',
    expiresInDays: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Get user info
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Check if user is admin
  if (user.role !== 'admin') {
    navigate('/catalog');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.message) {
      setError('Title and message are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Calculate expiration date if provided
      let expiresAt = null;
      if (formData.expiresInDays) {
        const days = parseInt(formData.expiresInDays);
        if (days > 0) {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + days);
          expiresAt = expiryDate.toISOString();
        }
      }

      const response = await axios.post(
        'http://localhost:5001/api/notifications/announcement',
        {
          title: formData.title,
          message: formData.message,
          priority: formData.priority,
          actionUrl: formData.actionUrl || null,
          expiresAt,
          adminRole: user.role
        }
      );

      if (response.data.success) {
        setSuccess(`Announcement sent to ${response.data.count} users successfully!`);
        // Reset form
        setFormData({
          title: '',
          message: '',
          priority: 'medium',
          actionUrl: '',
          expiresInDays: ''
        });
      }
    } catch (err) {
      console.error('Error sending announcement:', err);
      setError(err.response?.data?.message || 'Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        'http://localhost:5001/api/notifications/test',
        {
          userId: user.id
        }
      );

      if (response.data.success) {
        setSuccess('Test notification created! Check your notifications.');
      }
    } catch (err) {
      console.error('Error creating test notification:', err);
      setError(err.response?.data?.message || 'Failed to create test notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout 
      title="System Announcements" 
      subtitle="Send announcements to all active users"
    >
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Announcement Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Announcement Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., System Maintenance Scheduled"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                placeholder="Enter the announcement message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Characters: {formData.message.length}
              </p>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low - General Information</option>
                <option value="medium">Medium - Important Update</option>
                <option value="high">High - Urgent Notice</option>
                <option value="urgent">Urgent - Critical Alert</option>
              </select>
            </div>

            {/* Action URL (Optional) */}
            <div>
              <label htmlFor="actionUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Action URL (Optional)
              </label>
              <input
                type="text"
                id="actionUrl"
                name="actionUrl"
                value={formData.actionUrl}
                onChange={handleChange}
                placeholder="/catalog or https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                URL to redirect users when they click the notification
              </p>
            </div>

            {/* Expiry */}
            <div>
              <label htmlFor="expiresInDays" className="block text-sm font-medium text-gray-700 mb-2">
                Expires In (Days) (Optional)
              </label>
              <input
                type="number"
                id="expiresInDays"
                name="expiresInDays"
                value={formData.expiresInDays}
                onChange={handleChange}
                min="1"
                max="365"
                placeholder="Leave empty for no expiry"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Notification will auto-delete after specified days
              </p>
            </div>

            {/* Preview */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📢</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {formData.title || 'Announcement Title'}
                      </h4>
                      {formData.priority === 'urgent' && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Urgent
                        </span>
                      )}
                      {formData.priority === 'high' && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          High
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {formData.message || 'Your message will appear here...'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Just now</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleTestNotification}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition disabled:opacity-50"
              >
                Send Test to Yourself
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span>Send to All Users</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">ℹ️ Tips for Effective Announcements</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Keep it concise:</strong> Users are more likely to read short, clear messages</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Choose the right priority:</strong> Reserve "Urgent" for critical issues only</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Add action URLs:</strong> Guide users to relevant pages when needed</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Test first:</strong> Send a test notification to yourself before broadcasting</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Set expiry:</strong> Temporary announcements will auto-delete after the specified time</span>
            </li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnnouncements;
