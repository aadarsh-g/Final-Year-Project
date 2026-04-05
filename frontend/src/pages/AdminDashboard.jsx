import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import AdminLayout from "../components/AdminLayout";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const STATUS_COLORS = {
  pending:    "bg-yellow-100 text-yellow-800",
  confirmed:  "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped:    "bg-purple-100 text-purple-800",
  delivered:  "bg-green-100 text-green-800",
  cancelled:  "bg-red-100 text-red-800",
};

function StatCard({ label, value, sub, icon, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${iconBg} rounded-lg`}>
          <svg className={`w-6 h-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5001/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Dashboard" subtitle="Loading dashboard data…">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Dashboard" subtitle="">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6">{error}</div>
      </AdminLayout>
    );
  }

  const { stats, recentOrders, topBooks, monthlyRevenue, orderTypeBreakdown } = data;

  // Bar chart — monthly revenue
  const barData = {
    labels: monthlyRevenue.map((m) => m.label),
    datasets: [
      {
        label: "Revenue (Rs.)",
        data: monthlyRevenue.map((m) => m.revenue),
        backgroundColor: "rgba(59,130,246,0.7)",
        borderRadius: 6,
      },
      {
        label: "Orders",
        data: monthlyRevenue.map((m) => m.orders),
        backgroundColor: "rgba(16,185,129,0.7)",
        borderRadius: 6,
        yAxisID: "y1",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: {
      y:  { beginAtZero: true, title: { display: true, text: "Revenue (Rs.)" } },
      y1: { beginAtZero: true, position: "right", title: { display: true, text: "# Orders" }, grid: { drawOnChartArea: false } },
    },
  };

  // Doughnut chart — order type
  const doughnutData = {
    labels: ["Purchases", "Rentals"],
    datasets: [
      {
        data: [orderTypeBreakdown.purchase, orderTypeBreakdown.rental],
        backgroundColor: ["rgba(99,102,241,0.8)", "rgba(245,158,11,0.8)"],
        borderWidth: 2,
        borderColor: ["#6366f1", "#f59e0b"],
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: { legend: { position: "bottom" } },
    cutout: "65%",
  };

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Real-time overview of your store."
    >
      <div className="space-y-6">

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Books"
            value={stats.totalBooks.toLocaleString()}
            iconBg="bg-blue-100" iconColor="text-blue-600"
            icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
          <StatCard
            label="Total Users"
            value={stats.totalUsers.toLocaleString()}
            iconBg="bg-green-100" iconColor="text-green-600"
            icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
          <StatCard
            label="Active Rentals"
            value={stats.activeRentals.toLocaleString()}
            sub={stats.overdueRentals > 0 ? `${stats.overdueRentals} overdue` : null}
            iconBg="bg-amber-100" iconColor="text-amber-600"
            icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <StatCard
            label="Total Revenue"
            value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
            iconBg="bg-purple-100" iconColor="text-purple-600"
            icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </div>

        {/* ── Charts row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar chart — Monthly Revenue */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue &amp; Orders (Last 6 Months)</h2>
            <Bar data={barData} options={barOptions} />
          </div>

          {/* Doughnut — Order type */}
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 self-start">Order Type Breakdown</h2>
            <div className="w-52 h-52">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
            <div className="mt-4 w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />Purchases</span>
                <span className="font-semibold">{orderTypeBreakdown.purchase}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />Rentals</span>
                <span className="font-semibold">{orderTypeBreakdown.rental}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Orders + Top Books ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All →</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <p className="p-6 text-sm text-gray-400">No orders yet.</p>
              ) : recentOrders.map((order) => (
                <div key={order._id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {order.items?.[0]?.book?.title || "—"}
                        {order.items?.length > 1 && <span className="text-xs text-gray-400 ml-1">+{order.items.length - 1} more</span>}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.user?.fullName || "—"} · {new Date(order.createdAt).toLocaleDateString("en-NP")}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{order.orderNumber}</span>
                    <span className="text-sm font-semibold text-gray-800">Rs. {order.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Selling Books */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Top Selling Books</h2>
              <Link to="/admin/books" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All →</Link>
            </div>
            <div className="p-6 space-y-4">
              {topBooks.length === 0 ? (
                <p className="text-sm text-gray-400">No sales data yet.</p>
              ) : topBooks.map((book, i) => (
                <div key={book._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">#{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{book.title}</p>
                      <p className="text-xs text-gray-500">{book.author}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">Rs. {book.totalRevenue?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{book.totalSales} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { to: "/admin/books",   label: "Add New Book",   bg: "bg-blue-100",   color: "text-blue-600",   hover: "hover:border-blue-500",   icon: "M12 4v16m8-8H4" },
              { to: "/admin/orders",  label: "View Orders",    bg: "bg-green-100",  color: "text-green-600",  hover: "hover:border-green-500",  icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
              { to: "/admin/users",   label: "Manage Users",   bg: "bg-purple-100", color: "text-purple-600", hover: "hover:border-purple-500", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
              { to: "/admin/rentals", label: "View Rentals",   bg: "bg-amber-100",  color: "text-amber-600",  hover: "hover:border-amber-500",  icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className={`flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg ${a.hover} hover:shadow-md transition`}
              >
                <div className={`p-2 ${a.bg} rounded-lg`}>
                  <svg className={`w-5 h-5 ${a.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={a.icon} />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
