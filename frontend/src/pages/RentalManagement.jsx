import { useState } from "react";
import AdminLayout from "../components/AdminLayout";

function RentalManagement() {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedRental, setSelectedRental] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);

  // Mock rental data
  const activeRentals = [
    {
      id: "RNT001",
      user: { name: "Sarah Johnson", email: "sarah.j@email.com", phone: "+1 234-567-8901" },
      book: { title: "It Ends With Us", author: "Colleen Hoover", isbn: "978-1501110368" },
      rentedDate: "2024-12-15",
      dueDate: "2024-12-29",
      duration: 14,
      amount: 7.98,
      status: "Active",
      condition: "Good",
      daysLeft: 3,
    },
    {
      id: "RNT002",
      user: { name: "Mike Chen", email: "mike.c@email.com", phone: "+1 234-567-8902" },
      book: { title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "978-0743273565" },
      rentedDate: "2024-12-18",
      dueDate: "2024-12-25",
      duration: 7,
      amount: 2.99,
      status: "Overdue",
      condition: "Good",
      daysLeft: -1,
      lateFee: 2.00,
    },
    {
      id: "RNT003",
      user: { name: "Emma Davis", email: "emma.d@email.com", phone: "+1 234-567-8903" },
      book: { title: "1984", author: "George Orwell", isbn: "978-0451524935" },
      rentedDate: "2024-12-20",
      dueDate: "2025-01-03",
      duration: 14,
      amount: 5.98,
      status: "Active",
      condition: "Good",
      daysLeft: 8,
    },
    {
      id: "RNT004",
      user: { name: "John Smith", email: "john.s@email.com", phone: "+1 234-567-8904" },
      book: { title: "Pride and Prejudice", author: "Jane Austen", isbn: "978-0141439518" },
      rentedDate: "2024-12-10",
      dueDate: "2024-12-24",
      duration: 14,
      amount: 4.98,
      status: "Overdue",
      condition: "Good",
      daysLeft: -2,
      lateFee: 4.00,
    },
  ];

  const returnedRentals = [
    {
      id: "RNT005",
      user: { name: "Lisa Anderson", email: "lisa.a@email.com" },
      book: { title: "The Hobbit", author: "J.R.R. Tolkien", isbn: "978-0547928227" },
      rentedDate: "2024-12-01",
      dueDate: "2024-12-15",
      returnedDate: "2024-12-14",
      duration: 14,
      amount: 7.98,
      status: "Returned",
      returnCondition: "Good",
      lateFee: 0,
    },
    {
      id: "RNT006",
      user: { name: "Tom Wilson", email: "tom.w@email.com" },
      book: { title: "Harry Potter", author: "J.K. Rowling", isbn: "978-0439708180" },
      rentedDate: "2024-12-05",
      dueDate: "2024-12-19",
      returnedDate: "2024-12-21",
      duration: 14,
      amount: 9.98,
      status: "Returned Late",
      returnCondition: "Good",
      lateFee: 4.00,
    },
  ];

  const calculateLateFee = (daysLate) => {
    const feePerDay = 2.00;
    return (Math.abs(daysLate) * feePerDay).toFixed(2);
  };

  const handleReturnBook = (rental) => {
    setSelectedRental(rental);
    setShowReturnModal(true);
  };

  const confirmReturn = (condition) => {
    console.log("Returning book:", selectedRental.id, "Condition:", condition);
    // In real app, send to API
    setShowReturnModal(false);
    setSelectedRental(null);
  };

  const getDaysLeftColor = (daysLeft) => {
    if (daysLeft < 0) return "text-red-600";
    if (daysLeft <= 3) return "text-yellow-600";
    return "text-green-600";
  };

  const getStatusBadge = (status) => {
    const badges = {
      "Active": "bg-blue-100 text-blue-800",
      "Overdue": "bg-red-100 text-red-800",
      "Returned": "bg-green-100 text-green-800",
      "Returned Late": "bg-yellow-100 text-yellow-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <AdminLayout 
      title="Rental Management" 
      subtitle="Track and manage book rentals, returns, and overdue items"
    >
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rental Return Management</h1>
        <p className="text-gray-600">Track and manage book rentals and returns</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{activeRentals.filter(r => r.status === "Active").length}</p>
            <p className="text-sm text-gray-600">Active Rentals</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{activeRentals.filter(r => r.status === "Overdue").length}</p>
            <p className="text-sm text-gray-600">Overdue Rentals</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{returnedRentals.length}</p>
            <p className="text-sm text-gray-600">Returned This Month</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              ${activeRentals.filter(r => r.lateFee).reduce((sum, r) => sum + r.lateFee, 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">Pending Late Fees</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === "active"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                Active Rentals ({activeRentals.filter(r => r.status === "Active" || r.status === "Overdue").length})
              </button>
              <button
                onClick={() => setActiveTab("overdue")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === "overdue"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                Overdue ({activeRentals.filter(r => r.status === "Overdue").length})
              </button>
              <button
                onClick={() => setActiveTab("returned")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === "returned"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                Return History
              </button>
            </nav>
          </div>
        </div>

        {/* Active Rentals Tab */}
        {activeTab === "active" && (
          <div className="space-y-4">
            {activeRentals.filter(r => r.status === "Active" || r.status === "Overdue").map((rental) => (
              <div key={rental.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Left Section - Rental Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{rental.book.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(rental.status)}`}>
                            {rental.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-1">by {rental.book.author}</p>
                        <p className="text-sm text-gray-500">ISBN: {rental.book.isbn}</p>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Rented By</p>
                        <p className="font-semibold text-gray-900">{rental.user.name}</p>
                        <p className="text-sm text-gray-600">{rental.user.email}</p>
                        <p className="text-sm text-gray-600">{rental.user.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Rental Details</p>
                        <p className="text-sm text-gray-700">Rental ID: <span className="font-semibold">{rental.id}</span></p>
                        <p className="text-sm text-gray-700">Duration: <span className="font-semibold">{rental.duration} days</span></p>
                        <p className="text-sm text-gray-700">Amount: <span className="font-semibold">${rental.amount}</span></p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Rented: </span>
                        <span className="font-medium text-gray-900">{rental.rentedDate}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Due: </span>
                        <span className="font-medium text-gray-900">{rental.dueDate}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Days {rental.daysLeft >= 0 ? "Left" : "Overdue"}: </span>
                        <span className={`font-bold ${getDaysLeftColor(rental.daysLeft)}`}>
                          {Math.abs(rental.daysLeft)} days
                        </span>
                      </div>
                    </div>

                    {/* Late Fee Warning */}
                    {rental.lateFee && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className="text-sm font-semibold text-red-800">
                            Late Fee: ${rental.lateFee.toFixed(2)} ({Math.abs(rental.daysLeft)} days overdue @ $2.00/day)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex flex-col space-y-3 lg:w-48">
                    <button
                      onClick={() => handleReturnBook(rental)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Process Return</span>
                    </button>
                    
                    <button className="px-4 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition">
                      Send Reminder
                    </button>
                    
                    <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition">
                      Extend Rental
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Overdue Rentals Tab */}
        {activeTab === "overdue" && (
          <div className="space-y-4">
            {activeRentals.filter(r => r.status === "Overdue").length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Overdue Rentals!</h3>
                <p className="text-gray-600">All books are on time or have been returned.</p>
              </div>
            ) : (
              activeRentals.filter(r => r.status === "Overdue").map((rental) => (
                <div key={rental.id} className="bg-red-50 border-2 border-red-200 rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="text-lg font-bold text-red-900">{rental.book.title}</h3>
                        <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold">
                          {Math.abs(rental.daysLeft)} DAYS OVERDUE
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">
                        <strong>{rental.user.name}</strong> - {rental.user.email}
                      </p>
                      <p className="text-sm text-gray-700">
                        Due: <strong>{rental.dueDate}</strong> | Late Fee: <strong className="text-red-700">${rental.lateFee.toFixed(2)}</strong>
                      </p>
                    </div>
                    <button
                      onClick={() => handleReturnBook(rental)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                    >
                      Process Return
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Returned Rentals Tab */}
        {activeTab === "returned" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rental ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rented</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Returned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late Fee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {returnedRentals.map((rental) => (
                    <tr key={rental.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{rental.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{rental.book.title}</div>
                        <div className="text-sm text-gray-500">{rental.book.author}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{rental.user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rental.rentedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rental.dueDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rental.returnedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {rental.returnCondition}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                        ${rental.lateFee.toFixed(2)}
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
          </div>
        )}
      
      {/* Return Modal */}
      {showReturnModal && selectedRental && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Process Book Return</h3>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-2"><strong>Book:</strong> {selectedRental.book.title}</p>
                <p className="text-gray-700 mb-2"><strong>User:</strong> {selectedRental.user.name}</p>
                <p className="text-gray-700 mb-2"><strong>Rental ID:</strong> {selectedRental.id}</p>
                <p className="text-gray-700 mb-4"><strong>Rental Amount:</strong> ${selectedRental.amount}</p>
                
                {selectedRental.lateFee && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-red-800">
                      Late Fee: ${selectedRental.lateFee.toFixed(2)}
                    </p>
                    <p className="text-xs text-red-600">({Math.abs(selectedRental.daysLeft)} days overdue)</p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Book Condition on Return
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="good">Good - No damage</option>
                    <option value="fair">Fair - Minor wear</option>
                    <option value="damaged">Damaged - Requires repair</option>
                    <option value="lost">Lost - Book not returned</option>
                  </select>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Total Amount to Collect:</p>
                  <p className="text-2xl font-bold text-blue-900">
                    ${(selectedRental.amount + (selectedRental.lateFee || 0)).toFixed(2)}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Rental: ${selectedRental.amount} + Late Fee: ${(selectedRental.lateFee || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => confirmReturn("good")}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                >
                  Confirm Return
                </button>
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default RentalManagement;

