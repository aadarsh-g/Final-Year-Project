import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

/* ── constants ─────────────────────────────────────────────────────────────── */
const API = "http://localhost:5001/api";

/* ── helpers ───────────────────────────────────────────────────────────────── */
const getToken = () => localStorage.getItem("token");
const getUser = () => JSON.parse(localStorage.getItem("user") || "{}");

const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const daysLeft = (due) =>
  Math.ceil((new Date(due) - Date.now()) / 86_400_000);

/* ── status helpers ─────────────────────────────────────────────────────────── */
const ORDER_STATUS = {
  pending:    { label: "Pending",    cls: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  confirmed:  { label: "Confirmed",  cls: "bg-blue-100 text-blue-800 border-blue-200" },
  processing: { label: "Processing", cls: "bg-purple-100 text-purple-800 border-purple-200" },
  shipped:    { label: "Shipped",    cls: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  delivered:  { label: "Delivered",  cls: "bg-green-100 text-green-800 border-green-200" },
  cancelled:  { label: "Cancelled",  cls: "bg-red-100 text-red-800 border-red-200" },
};

const PAYMENT_STATUS = {
  pending:   { label: "Pending",   cls: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: "⏳" },
  completed: { label: "Paid",      cls: "bg-green-100 text-green-700 border-green-200",    icon: "✅" },
  failed:    { label: "Failed",    cls: "bg-red-100 text-red-700 border-red-200",          icon: "❌" },
  refunded:  { label: "Refunded",  cls: "bg-purple-100 text-purple-700 border-purple-200", icon: "↩️" },
};

const RENTAL_STATUS = {
  active:   { label: "Active",   cls: "bg-blue-100 text-blue-800 border-blue-200" },
  overdue:  { label: "Overdue",  cls: "bg-red-100 text-red-800 border-red-200" },
  returned: { label: "Returned", cls: "bg-green-100 text-green-800 border-green-200" },
};

const StatusBadge = ({ status, map }) => {
  const info = map[status] || { label: status, cls: "bg-gray-100 text-gray-700 border-gray-200" };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${info.cls}`}>
      {info.label}
    </span>
  );
};

/* ── skeleton loader ────────────────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="space-y-4">
    {[1, 2].map((i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="flex justify-between mb-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-20" />
        </div>
        <div className="flex gap-4">
          <div className="w-12 h-16 bg-gray-200 rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ── empty state ────────────────────────────────────────────────────────────── */
const EmptyState = ({ icon, title, message, link, linkLabel }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-16 text-center">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6 text-sm">{message}</p>
    {link && (
      <Link
        to={link}
        className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition"
      >
        {linkLabel}
      </Link>
    )}
  </div>
);

/* ── error state ─────────────────────────────────────────────────────────────── */
const ErrorState = ({ message, onRetry }) => (
  <div className="bg-white rounded-xl shadow-sm border border-red-100 py-12 text-center">
    <div className="text-5xl mb-4">⚠️</div>
    <h3 className="text-lg font-bold text-gray-800 mb-2">Something went wrong</h3>
    <p className="text-red-600 mb-6 text-sm">{message}</p>
    <button
      onClick={onRetry}
      className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition"
    >
      Try Again
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════════════════════════ */
export default function UserOrders() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.fullName || user.name || "Reader";
  
  const userInitial = userName.charAt(0).toUpperCase();

  const [activeTab, setActiveTab] = useState("orders");

  /* ── orders state ─────────────────────────────────────────────────────────── */
  const [orders, setOrders]               = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError]     = useState("");
  const [cancellingId, setCancellingId]   = useState(null);

  /* ── rentals state ────────────────────────────────────────────────────────── */
  const [rentals, setRentals]               = useState([]);
  const [rentalsLoading, setRentalsLoading] = useState(true);
  const [rentalsError, setRentalsError]     = useState("");

  /* ── auth guard ────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!getToken()) {
      navigate("/login");
    }
  }, [navigate]);

  /* ── fetch orders ─────────────────────────────────────────────────────────── */
  const fetchOrders = useCallback(async () => {
    if (!getToken()) return;
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const { data } = await axios.get(`${API}/checkout/orders`, {
        headers: authHeader(),
      });
      setOrders(data.orders || []);
    } catch (err) {
      console.error("fetchOrders error:", err.response?.status, err.response?.data);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        setOrdersError(
          err.response?.data?.message ||
          `Error ${err.response?.status || "unknown"}: Failed to load orders.`
        );
      }
    } finally {
      setOrdersLoading(false);
    }
  }, [navigate]);

  /* ── fetch rentals ────────────────────────────────────────────────────────── */
  const fetchRentals = useCallback(async () => {
    if (!getToken()) return;
    setRentalsLoading(true);
    setRentalsError("");
    try {
      const { data } = await axios.get(`${API}/rentals/my-rentals`, {
        headers: authHeader(),
      });
      setRentals(data.rentals || []);
    } catch (err) {
      console.error("fetchRentals error:", err.response?.status, err.response?.data);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        setRentalsError(
          err.response?.data?.message ||
          `Error ${err.response?.status || "unknown"}: Failed to load rentals.`
        );
      }
    } finally {
      setRentalsLoading(false);
    }
  }, [navigate]);

  /* initial load */
  useEffect(() => {
    fetchOrders();
    fetchRentals();
  }, [fetchOrders, fetchRentals]);

  /* ── cancel order ─────────────────────────────────────────────────────────── */
  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    setCancellingId(orderId);
    try {
      await axios.put(`${API}/checkout/order/${orderId}/cancel`, {}, { headers: authHeader() });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Could not cancel order.");
    } finally {
      setCancellingId(null);
    }
  };

  /* ── derived data ────────────────────────────────────────────────────────── */
  const activeRentals = rentals.filter((r) => r.status === "active" || r.status === "overdue");
  const pastRentals   = rentals.filter((r) => r.status === "returned");

  const TABS = [
    { key: "orders",         label: "Purchase Orders", count: orders.length,        loading: ordersLoading },
    { key: "active-rentals", label: "Active Rentals",  count: activeRentals.length, loading: rentalsLoading },
    { key: "past-rentals",   label: "Rental History",  count: pastRentals.length,   loading: rentalsLoading },
  ];

  /* ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navbar ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex flex-col gap-0.5">
                <div className="w-5 h-5 bg-green-500 rounded-sm" />
                <div className="w-5 h-4 bg-orange-500 rounded-sm" />
                <div className="w-5 h-3 bg-red-500 rounded-sm" />
              </div>
              <span className="text-xl font-bold text-gray-800">Bookify</span>
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link to="/"        className="text-gray-600 hover:text-blue-600 transition">Home</Link>
              <Link to="/catalog" className="text-gray-600 hover:text-blue-600 transition">Catalog</Link>
              <Link to="/orders"  className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-0.5">My Orders</Link>
              <Link to="/cart"    className="text-gray-600 hover:text-blue-600 transition">Cart</Link>
            </nav>

            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {userInitial}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">{userName}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Hero banner ── */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 md:p-8 mb-8 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold shrink-0">
              {userInitial}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">My Orders &amp; Rentals</h1>
              <p className="text-blue-100 text-sm mt-1">Welcome back, {userName}!</p>
            </div>
            {/* Refresh button */}
            <button
              onClick={() => { fetchOrders(); fetchRentals(); }}
              className="ml-auto bg-white/20 hover:bg-white/30 transition px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Orders",   value: ordersLoading  ? "—" : orders.length,        color: "text-blue-600",  bg: "bg-blue-50",  icon: "🛍️" },
            { label: "Active Rentals", value: rentalsLoading ? "—" : activeRentals.length,  color: "text-green-600", bg: "bg-green-50", icon: "📖" },
            { label: "Rental History", value: rentalsLoading ? "—" : pastRentals.length,    color: "text-amber-600", bg: "bg-amber-50", icon: "📋" },
            { label: "Delivered",      value: ordersLoading  ? "—" : orders.filter(o => o.status === "delivered").length, color: "text-purple-600", bg: "bg-purple-50", icon: "✅" },
          ].map(({ label, value, color, bg, icon }) => (
            <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center text-base`}>{icon}</div>
              </div>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <nav className="flex border-b border-gray-100 -mb-px">
            {TABS.map(({ key, label, count, loading }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 sm:flex-none px-5 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {label}
                {!loading && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === key ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* ════════════════════ PURCHASE ORDERS TAB ════════════════════ */}
        {activeTab === "orders" && (
          ordersLoading ? <Skeleton /> :
          ordersError   ? <ErrorState message={ordersError} onRetry={fetchOrders} /> :
          orders.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No orders yet"
              message="You haven't placed any orders. Browse our catalog to get started!"
              link="/catalog"
              linkLabel="Browse Books"
            />
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                  {/* Order header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Order</p>
                        <p className="font-semibold text-gray-900">{order.orderNumber || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Date</p>
                        <p className="font-semibold text-gray-900">{fmtDate(order.orderDate || order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Total</p>
                        <p className="font-semibold text-gray-900">Rs. {(order.totalAmount ?? 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Payment</p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {(order.paymentMethod || "—").replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <StatusBadge status={order.status} map={ORDER_STATUS} />
                      {order.paymentStatus && (() => {
                        const pm = PAYMENT_STATUS[order.paymentStatus] || { label: order.paymentStatus, cls: "bg-gray-100 text-gray-700 border-gray-200", icon: "💳" };
                        return (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 w-fit ${pm.cls}`}>
                            <span>{pm.icon}</span>
                            <span>Payment: {pm.label}</span>
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-6 py-5">
                    <div className="divide-y divide-gray-50">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                          {/* Cover */}
                          <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden shrink-0">
                            {item.bookSnapshot?.coverImage ? (
                              <img
                                src={item.bookSnapshot.coverImage}
                                alt={item.bookSnapshot.title}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">📚</div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {item.bookSnapshot?.title || "Unknown Book"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {item.bookSnapshot?.author || ""}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {item.type === "rental"
                                ? `Rental · ${item.rentalDuration} days`
                                : `Purchase × ${item.quantity}`}
                            </p>
                          </div>

                          <p className="font-semibold text-gray-800 text-sm shrink-0">
                            Rs. {(item.subtotal ?? 0).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Status banners */}
                    {order.status === "delivered" && (
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2">
                        <span className="text-green-600 text-lg">✅</span>
                        <span className="text-sm font-medium text-green-800">
                          Delivered on {fmtDate(order.deliveredAt)}
                          {order.trackingNumber && ` · Tracking: ${order.trackingNumber}`}
                        </span>
                      </div>
                    )}
                    {order.status === "shipped" && (
                      <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 flex items-center gap-2">
                        <span className="text-lg">🚚</span>
                        <span className="text-sm font-medium text-indigo-800">
                          Shipped{order.trackingNumber ? ` · Tracking: ${order.trackingNumber}` : ""}
                        </span>
                      </div>
                    )}
                    {order.status === "processing" && (
                      <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 flex items-center gap-2">
                        <span className="text-lg">⚙️</span>
                        <span className="text-sm font-medium text-purple-800">Your order is being processed</span>
                      </div>
                    )}
                    {order.status === "confirmed" && (
                      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-2">
                        <span className="text-lg">🎉</span>
                        <span className="text-sm font-medium text-blue-800">Order confirmed! We'll start processing it soon.</span>
                      </div>
                    )}

                    {/* Cancel action */}
                    {(order.status === "pending" || order.status === "confirmed") && (
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => handleCancel(order._id)}
                          disabled={cancellingId === order._id}
                          className="px-4 py-2 text-sm font-medium text-red-600 border-2 border-red-300 hover:bg-red-50 hover:border-red-400 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingId === order._id ? "Cancelling…" : "Cancel Order"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ════════════════════ ACTIVE RENTALS TAB ════════════════════ */}
        {activeTab === "active-rentals" && (
          rentalsLoading ? <Skeleton /> :
          rentalsError   ? <ErrorState message={rentalsError} onRetry={fetchRentals} /> :
          activeRentals.length === 0 ? (
            <EmptyState
              icon="📖"
              title="No active rentals"
              message="You don't have any books rented right now."
              link="/catalog"
              linkLabel="Browse Books to Rent"
            />
          ) : (
            <div className="space-y-5">
              {activeRentals.map((rental) => {
                const left     = daysLeft(rental.dueDate);
                const isUrgent = left <= 3 && rental.status !== "overdue";
                return (
                  <div key={rental._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Cover */}
                        <div className="w-24 h-36 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {rental.book?.coverImage ? (
                            <img
                              src={rental.book.coverImage}
                              alt={rental.book.title}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">📚</div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {rental.book?.title || "Unknown Book"}
                              </h3>
                              <p className="text-sm text-gray-500">by {rental.book?.author || "—"}</p>
                            </div>
                            <StatusBadge status={rental.status} map={RENTAL_STATUS} />
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
                            {[
                              { label: "Rental #",   value: rental.rentalNumber || "—" },
                              { label: "Duration",   value: `${rental.rentalDuration} days` },
                              { label: "Rented On",  value: fmtDate(rental.startDate) },
                              { label: "Due Date",   value: fmtDate(rental.dueDate), urgent: isUrgent || rental.status === "overdue" },
                            ].map(({ label, value, urgent }) => (
                              <div key={label}>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
                                <p className={`font-semibold ${urgent ? "text-red-600" : "text-gray-900"}`}>{value}</p>
                              </div>
                            ))}
                          </div>

                          {/* Countdown / overdue banner */}
                          <div className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-medium ${
                            rental.status === "overdue"
                              ? "bg-red-50 border-red-200 text-red-700"
                              : isUrgent
                              ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                              : "bg-blue-50 border-blue-200 text-blue-700"
                          }`}>
                            <span>
                              {rental.status === "overdue"
                                ? `⚠️ Overdue by ${rental.overdueDays || 0} day(s) · Fine: Rs. ${(rental.fineAmount || 0).toFixed(2)}`
                                : left > 0
                                ? `${isUrgent ? "⏰" : "🕒"} ${left} day(s) remaining`
                                : "📅 Due today!"}
                            </span>
                            <span className="font-bold text-gray-800">
                              Rs. {(rental.totalRentalAmount ?? 0).toFixed(2)}
                            </span>
                          </div>

                          {isUrgent && (
                            <p className="text-xs text-yellow-600 mt-2">
                              ⚠️ Return soon to avoid late fees (Rs. {rental.finePerDay ?? 20}/day)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ════════════════════ RENTAL HISTORY TAB ════════════════════ */}
        {activeTab === "past-rentals" && (
          rentalsLoading ? <Skeleton /> :
          rentalsError   ? <ErrorState message={rentalsError} onRetry={fetchRentals} /> :
          pastRentals.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No rental history"
              message="Your returned rentals will appear here."
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["Book", "Rented", "Due Date", "Returned", "Duration", "Amount", "Status"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pastRentals.map((rental) => (
                      <tr key={rental._id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-12 bg-gray-100 rounded overflow-hidden shrink-0">
                              {rental.book?.coverImage ? (
                                <img
                                  src={rental.book.coverImage}
                                  alt={rental.book.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.style.display = "none"; }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-base">📚</div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 line-clamp-1">{rental.book?.title || "Unknown"}</p>
                              <p className="text-xs text-gray-400">{rental.book?.author || ""}</p>
                              <p className="text-xs text-gray-300">{rental.rentalNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-gray-600">{fmtDate(rental.startDate)}</td>
                        <td className="px-5 py-4 whitespace-nowrap text-gray-600">{fmtDate(rental.dueDate)}</td>
                        <td className="px-5 py-4 whitespace-nowrap text-gray-600">{fmtDate(rental.returnDate)}</td>
                        <td className="px-5 py-4 whitespace-nowrap text-gray-600">{rental.rentalDuration} days</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="font-semibold text-gray-900">Rs. {(rental.totalRentalAmount ?? 0).toFixed(2)}</p>
                          {rental.fineAmount > 0 && (
                            <p className="text-xs text-red-500 mt-0.5">+Rs. {rental.fineAmount.toFixed(2)} fine</p>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <StatusBadge status={rental.status} map={RENTAL_STATUS} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-200 mt-16 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-3">
                <div className="flex flex-col gap-0.5">
                  <div className="w-4 h-4 bg-green-500 rounded-sm" />
                  <div className="w-4 h-3 bg-orange-500 rounded-sm" />
                  <div className="w-4 h-2.5 bg-red-500 rounded-sm" />
                </div>
                <span className="font-bold text-gray-800">Bookify</span>
              </Link>
              <p className="text-gray-500 text-xs">Bringing stories to your doorstep.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">Quick Links</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                <li><Link to="/"        className="hover:text-blue-600">Home</Link></li>
                <li><Link to="/catalog" className="hover:text-blue-600">Catalog</Link></li>
                <li><Link to="/orders"  className="hover:text-blue-600">My Orders</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">Services</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                <li>Book Purchase</li>
                <li>Book Rental</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">Contact</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                <li>info@bookify.com</li>
                <li>+977 1-234-5678</li>
                <li>Kathmandu, Nepal</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
            © 2025 Bookify. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
