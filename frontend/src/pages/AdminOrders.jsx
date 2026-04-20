import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

/* ─── tiny in-page toast helper ─── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors =
    type === 'success'
      ? 'bg-green-600 text-white'
      : 'bg-red-600 text-white'; 

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg ${colors} transition-all`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white/70 hover:text-white text-lg leading-none">×</button>
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [statusFilter, setStatusFilter]   = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [searchTerm, setSearchTerm]       = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  // savedStatus / savedPaymentStatus track what is ACTUALLY in the DB so the
  // disabled check never uses a stale optimistic-update value.
  const [savedStatus, setSavedStatus]               = useState('');
  const [savedPaymentStatus, setSavedPaymentStatus] = useState('');
  const [showModal, setShowModal]         = useState(false);
  const [updating, setUpdating]           = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [toast, setToast]                 = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => setToast({ message, type });
  const hideToast = useCallback(() => setToast(null), []);

  /* ─── Fetch orders ─── */
  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/checkout/orders/all', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: statusFilter || undefined,
          paymentStatus: paymentFilter || undefined,
        },
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showToast('Session expired. Please login again.', 'error');
        setTimeout(() => navigate('/login'), 1500);
      } else if (status === 403) {
        showToast('Access denied. Admin privileges required.', 'error');
        setTimeout(() => navigate('/catalog'), 1500);
      } else {
        showToast('Failed to load orders. Please try again.', 'error');
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, paymentFilter, navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* ─── Open modal ─── */
  const openModal = (order) => {
    setSelectedOrder(order);
    const initStatus        = order.status          || 'pending';
    const initPaymentStatus = order.paymentStatus   || 'pending';
    setSelectedStatus(initStatus);
    setSelectedPaymentStatus(initPaymentStatus);
    setSavedStatus(initStatus);
    setSavedPaymentStatus(initPaymentStatus);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setSelectedStatus('');
    setSelectedPaymentStatus('');
    setSavedStatus('');
    setSavedPaymentStatus('');
  };

  /* ─── Update order status ─── */
  const handleUpdateStatus = async () => {
    if (!selectedOrder || selectedStatus === savedStatus) {
      showToast('Please choose a different status to update.', 'error');
      return;
    }

    const orderId   = selectedOrder._id;
    const newStatus = selectedStatus;

    try {
      setUpdating(true);
      const token = localStorage.getItem('token');

      await axios.put(
        `http://localhost:5001/api/checkout/order/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      setSavedStatus(newStatus);    // ← lock the comparison to the newly-saved value

      showToast(`Order #${selectedOrder.orderNumber} status → "${newStatus}" ✅  Email sent to customer.`);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update order status';
      showToast(msg, 'error');
      fetchOrders();
    } finally {
      setUpdating(false);
    }
  };

  /* ─── Update payment status ─── */
  const handleUpdatePaymentStatus = async () => {
    if (!selectedOrder || selectedPaymentStatus === savedPaymentStatus) {
      showToast('Please choose a different payment status to update.', 'error');
      return;
    }

    const orderId          = selectedOrder._id;
    const newPaymentStatus = selectedPaymentStatus;

    try {
      setUpdatingPayment(true);
      const token = localStorage.getItem('token');

      await axios.put(
        `http://localhost:5001/api/checkout/order/${orderId}/payment-status`,
        { paymentStatus: newPaymentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o))
      );
      setSelectedOrder((prev) => ({ ...prev, paymentStatus: newPaymentStatus }));
      setSavedPaymentStatus(newPaymentStatus); // ← lock the comparison to the newly-saved value

      showToast(`Payment status → "${newPaymentStatus}" ✅  Email sent to customer.`);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update payment status';
      showToast(msg, 'error');
      fetchOrders();
    } finally {
      setUpdatingPayment(false);
    }
  };

  /* ─── Helpers ─── */
  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(q) ||
      order.user?.fullName?.toLowerCase().includes(q) ||
      order.user?.email?.toLowerCase().includes(q)
    );
  });

  const statusColor = (s) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return map[s] || 'bg-gray-100 text-gray-800';
  };

  const paymentColor = (s) => {
    const map = {
      completed: 'bg-green-100 text-green-800',
      pending:   'bg-yellow-100 text-yellow-800',
      failed:    'bg-red-100 text-red-800',
      refunded:  'bg-gray-100 text-gray-800',
    };
    return map[s] || 'bg-gray-100 text-gray-800';
  };

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'N/A';

  /* ─── Stats ─── */
  const totalRevenue    = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pendingOrders   = orders.filter((o) => o.status === 'pending').length;
  const completedOrders = orders.filter((o) => o.status === 'delivered').length;

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <AdminLayout title="Orders Management" subtitle="View and manage all customer orders">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-500">Loading orders…</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Orders Management" subtitle="View and manage all customer orders">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Total Orders',  value: orders.length,              color: 'blue',   icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
          { label: 'Total Revenue', value: `Rs. ${totalRevenue.toFixed(2)}`, color: 'green', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Pending',       value: pendingOrders,              color: 'yellow', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Delivered',     value: completedOrders,            color: 'green',  icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`bg-${color}-100 p-3 rounded-full`}>
              <svg className={`w-6 h-6 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Order #, name or email…"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payments</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Orders Table ── */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{order.user?.fullName || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{order.user?.email || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.items?.length || 0} item(s)</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      Rs. {order.totalAmount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${paymentColor(order.paymentStatus)}`}>
                        {order.paymentStatus || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor(order.status)}`}>
                        {order.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fmtDate(order.orderDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openModal(order)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Order Details Modal ── */}
      {showModal && selectedOrder && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                <p className="text-sm text-gray-500">{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order Number</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order Date</p>
                  <p className="font-semibold text-gray-900">{new Date(selectedOrder.orderDate).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${statusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment</p>
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${paymentColor(selectedOrder.paymentStatus)}`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-2">Customer Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                  <p className="text-sm"><span className="font-medium">Name:</span> {selectedOrder.customerInfo?.fullName || selectedOrder.user?.fullName || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {selectedOrder.customerInfo?.email || selectedOrder.user?.email || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">Phone:</span> {selectedOrder.customerInfo?.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-2">Shipping Address</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                  <p className="text-sm">{selectedOrder.shippingAddress?.street || 'N/A'}</p>
                  <p className="text-sm">
                    {[selectedOrder.shippingAddress?.city, selectedOrder.shippingAddress?.state].filter(Boolean).join(', ')}
                  </p>
                  <p className="text-sm">
                    {[selectedOrder.shippingAddress?.zipCode, selectedOrder.shippingAddress?.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-2">Order Items</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.bookSnapshot?.title || 'Unknown Book'}</p>
                        <p className="text-sm text-gray-500">{item.bookSnapshot?.author || 'Unknown Author'}</p>
                        <p className="text-sm text-gray-500">
                          {item.type === 'purchase'
                            ? `Qty: ${item.quantity}`
                            : `Rental · ${item.rentalDuration} days`}
                        </p>
                        {item.type === 'rental' && item.rentalStartDate && (
                          <p className="text-xs text-gray-400">
                            {new Date(item.rentalStartDate).toLocaleDateString()} – {new Date(item.rentalEndDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">Rs. {item.subtotal?.toFixed(2)}</p>
                        <p className="text-sm text-gray-400">Rs. {item.pricePerUnit?.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">Rs. {selectedOrder.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-Rs. {selectedOrder.discountAmount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold border-t border-gray-300 pt-2">
                  <span>Total:</span>
                  <span>Rs. {selectedOrder.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">{selectedOrder.paymentMethod?.replace('_', ' ') || 'N/A'}</span>
                </div>
              </div>

              {/* ── Update Order Status ── */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-3">Update Order Status</h4>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating || selectedStatus === savedStatus}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {updating ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Updating…
                      </span>
                    ) : 'Update Status'}
                  </button>
                </div>
                
              </div>

              {/* ── Update Payment Status ── */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-3">Update Payment Status</h4>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <button
                    onClick={handleUpdatePaymentStatus}
                    disabled={updatingPayment || selectedPaymentStatus === savedPaymentStatus}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {updatingPayment ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Updating…
                      </span>
                    ) : 'Update Payment'}
                  </button>
                </div>
                
              </div>

              {/* Customer Notes */}
              {selectedOrder.customerNotes && (
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Customer Notes</h4>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedOrder.customerNotes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminOrders;
