import { useState } from "react";
import { Link } from "react-router-dom";

function UserOrders() {
  const [activeTab, setActiveTab] = useState("orders");

  // Mock user data
  const userData = {
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    memberSince: "2023",
  };

  // Mock orders data
  const orders = [
    {
      id: "ORD001",
      date: "2024-12-20",
      items: [
        { title: "It Ends With Us", author: "Colleen Hoover", price: 14.99, image: "/images/It ends with us.jpg" },
      ],
      total: 14.99,
      status: "Delivered",
      trackingNumber: "TRK123456789",
      deliveryDate: "2024-12-23",
    },
    {
      id: "ORD002",
      date: "2024-12-15",
      items: [
        { title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 12.99, image: "/images/The Great Gatsby.jpg" },
        { title: "1984", author: "George Orwell", price: 13.49, image: "/images/1984.jpg" },
      ],
      total: 26.48,
      status: "Delivered",
      trackingNumber: "TRK987654321",
      deliveryDate: "2024-12-18",
    },
    {
      id: "ORD003",
      date: "2024-12-25",
      items: [
        { title: "Harry Potter", author: "J.K. Rowling", price: 16.99, image: "/images/Harry Potter.jpg" },
      ],
      total: 16.99,
      status: "Processing",
      estimatedDelivery: "2024-12-28",
    },
  ];

  // Mock rentals data
  const activeRentals = [
    {
      id: "RNT001",
      book: { title: "Pride and Prejudice", author: "Jane Austen", image: "/images/Pride and Prejudice.jpg" },
      rentedDate: "2024-12-20",
      dueDate: "2025-01-03",
      duration: 14,
      amount: 4.98,
      status: "Active",
      daysLeft: 8,
    },
    {
      id: "RNT002",
      book: { title: "The Hobbit", author: "J.R.R. Tolkien", image: "/images/The Hobbit.jpg" },
      rentedDate: "2024-12-15",
      dueDate: "2024-12-29",
      duration: 14,
      amount: 7.98,
      status: "Active",
      daysLeft: 3,
    },
  ];

  const pastRentals = [
    {
      id: "RNT003",
      book: { title: "To Kill a Mockingbird", author: "Harper Lee", image: "/images/To kill a mockingbird.jpg" },
      rentedDate: "2024-12-01",
      dueDate: "2024-12-15",
      returnedDate: "2024-12-14",
      duration: 14,
      amount: 4.98,
      status: "Returned",
    },
    {
      id: "RNT004",
      book: { title: "The Fault In Our Stars", author: "John Green", image: "/images/The Fault In Our Stars.jpg" },
      rentedDate: "2024-11-20",
      dueDate: "2024-12-04",
      returnedDate: "2024-12-06",
      duration: 14,
      amount: 6.98,
      status: "Returned Late",
      lateFee: 4.00,
    },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      "Delivered": "bg-green-100 text-green-800",
      "Processing": "bg-blue-100 text-blue-800",
      "Shipped": "bg-purple-100 text-purple-800",
      "Cancelled": "bg-red-100 text-red-800",
      "Active": "bg-blue-100 text-blue-800",
      "Returned": "bg-green-100 text-green-800",
      "Returned Late": "bg-yellow-100 text-yellow-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getDaysLeftColor = (daysLeft) => {
    if (daysLeft <= 3) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex flex-col">
                <div className="w-6 h-6 bg-green-500 rounded-sm mb-0.5"></div>
                <div className="w-6 h-5 bg-orange-500 rounded-sm mb-0.5"></div>
                <div className="w-6 h-4 bg-red-500 rounded-sm"></div>
              </div>
              <span className="text-xl md:text-2xl font-bold text-gray-800">Bookify</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition">
                Home
              </Link>
              <Link to="/catalog" className="text-gray-700 hover:text-blue-600 transition">
                Catalog
              </Link>
              <Link to="/orders" className="text-blue-600 font-medium hover:text-blue-700 transition">
                My Orders
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link to="/login" className="hidden sm:block text-gray-700 hover:text-blue-600 transition">
                Account
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 md:p-8 mb-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">{userData.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">My Orders & Rentals</h1>
              <p className="text-blue-100">Welcome back, {userData.name}!</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Total Orders</p>
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-800">{orders.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Active Rentals</p>
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-800">{activeRentals.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Member Since</p>
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-800">{userData.memberSince}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === "orders"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                Purchase Orders
              </button>
              <button
                onClick={() => setActiveTab("active-rentals")}
                className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === "active-rentals"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                Active Rentals ({activeRentals.length})
              </button>
              <button
                onClick={() => setActiveTab("rental-history")}
                className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === "rental-history"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                Rental History
              </button>
            </nav>
          </div>
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Order ID</p>
                        <p className="font-semibold text-gray-900">{order.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Order Date</p>
                        <p className="font-semibold text-gray-900">{order.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-16 h-24 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.author}</p>
                        </div>
                        <p className="font-semibold text-gray-900">${item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Order Status Info */}
                  {order.status === "Delivered" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium text-green-800">
                          Delivered on {order.deliveryDate}
                        </span>
                      </div>
                      {order.trackingNumber && (
                        <p className="text-xs text-green-700 mt-1">Tracking: {order.trackingNumber}</p>
                      )}
                    </div>
                  )}

                  {order.status === "Processing" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="text-sm font-medium text-blue-800">
                          Processing - Estimated delivery: {order.estimatedDelivery}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button className="px-4 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition text-sm">
                      View Details
                    </button>
                    {order.status === "Delivered" && (
                      <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition text-sm">
                        Write Review
                      </button>
                    )}
                    {order.status === "Processing" && (
                      <button className="px-4 py-2 border-2 border-red-600 text-red-600 hover:bg-red-50 rounded-lg font-medium transition text-sm">
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Rentals Tab */}
        {activeTab === "active-rentals" && (
          <div className="space-y-6">
            {activeRentals.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Rentals</h3>
                <p className="text-gray-600 mb-4">You don't have any books rented at the moment.</p>
                <Link to="/catalog" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                  Browse Books to Rent
                </Link>
              </div>
            ) : (
              activeRentals.map((rental) => (
                <div key={rental.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Book Image */}
                      <div className="w-32 h-48 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={rental.book.image}
                          alt={rental.book.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>

                      {/* Rental Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{rental.book.title}</h3>
                            <p className="text-gray-600 mb-2">by {rental.book.author}</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(rental.status)}`}>
                              {rental.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Rental ID</p>
                            <p className="font-semibold text-gray-900">{rental.id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Duration</p>
                            <p className="font-semibold text-gray-900">{rental.duration} days</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Rented On</p>
                            <p className="font-semibold text-gray-900">{rental.rentedDate}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Due Date</p>
                            <p className="font-semibold text-gray-900">{rental.dueDate}</p>
                          </div>
                        </div>

                        {/* Days Left Alert */}
                        <div className={`p-4 rounded-lg mb-4 ${
                          rental.daysLeft <= 3 ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <svg className={`w-5 h-5 ${rental.daysLeft <= 3 ? 'text-yellow-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className={`text-sm font-semibold ${getDaysLeftColor(rental.daysLeft)}`}>
                                {rental.daysLeft} days left
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">${rental.amount.toFixed(2)}</span>
                          </div>
                          {rental.daysLeft <= 3 && (
                            <p className="text-xs text-yellow-700 mt-1">⚠️ Return soon to avoid late fees ($2.00/day)</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                            Extend Rental
                          </button>
                          <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition">
                            Return Instructions
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Rental History Tab */}
        {activeTab === "rental-history" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {pastRentals.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Rental History</h3>
                <p className="text-gray-600">Your past rentals will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rented</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Returned</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pastRentals.map((rental) => (
                      <tr key={rental.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={rental.book.image}
                                alt={rental.book.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{rental.book.title}</p>
                              <p className="text-sm text-gray-600">{rental.book.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rental.rentedDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rental.dueDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rental.returnedDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-semibold text-gray-900">${rental.amount.toFixed(2)}</p>
                          {rental.lateFee > 0 && (
                            <p className="text-xs text-red-600">+${rental.lateFee.toFixed(2)} late fee</p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(rental.status)}`}>
                            {rental.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 md:py-10 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex flex-col">
                  <div className="w-5 h-5 bg-green-500 rounded-sm mb-0.5"></div>
                  <div className="w-5 h-4 bg-orange-500 rounded-sm mb-0.5"></div>
                  <div className="w-5 h-3 bg-red-500 rounded-sm"></div>
                </div>
                <span className="text-lg font-bold text-gray-800">Bookify</span>
              </div>
              <p className="text-gray-600 text-sm">Bringing stories to your doorstep with ease.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-600 hover:text-blue-600 transition text-sm">Home</Link></li>
                <li><Link to="/catalog" className="text-gray-600 hover:text-blue-600 transition text-sm">Catalog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Services</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition text-sm">Renting System</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition text-sm">Book Store</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Email: info@OnlineBookstore.com</li>
                <li>Phone: (123) 321-4565</li>
                <li>Address: Kathmandu</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 text-center">
            <p className="text-gray-600 text-sm">© 2025 Bookify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default UserOrders;

