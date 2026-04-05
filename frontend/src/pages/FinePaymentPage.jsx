import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function FinePaymentPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingFine, setPayingFine] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

  useEffect(() => {
    fetchOverdueRentals();
  }, []);

  const fetchOverdueRentals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/rentals/overdue', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRentals(response.data.rentals || []);
    } catch (error) {
      console.error('Error fetching overdue rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayFine = async () => {
    try {
      setPayingFine(selectedRental._id);
      const token = localStorage.getItem('token');

      if (paymentMethod === 'khalti') {
        // Khalti fine payment — initiate then redirect
        const response = await axios.post(
          `http://localhost:5001/api/khalti/initiate-fine/${selectedRental._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setShowPaymentModal(false);
          window.location.href = response.data.paymentUrl;
        }
        return;
      }

      // Non-Khalti methods
      await axios.post(
        `http://localhost:5001/api/rentals/${selectedRental._id}/pay-fine`,
        { paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Fine paid successfully!');
      setShowPaymentModal(false);
      setSelectedRental(null);
      fetchOverdueRentals();
    } catch (error) {
      console.error('Error paying fine:', error);
      alert(error.response?.data?.message || 'Failed to pay fine');
    } finally {
      setPayingFine(null);
    }
  };

  const openPaymentModal = (rental) => {
    setSelectedRental(rental);
    setShowPaymentModal(true);
  };

  const totalPendingFines = rentals
    .filter(r => r.fineStatus === 'pending')
    .reduce((sum, r) => sum + (r.fineAmount || 0), 0);

  const getDaysOverdueColor = (days) => {
    if (days >= 10) return 'text-red-600';
    if (days >= 5) return 'text-orange-600';
    return 'text-yellow-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading fines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/catalog" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fine Payments</h1>
                <p className="text-sm text-gray-600">Manage your overdue rental fines</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Card */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Rs. {totalPendingFines.toFixed(2)}</h2>
              <p className="text-red-100 mt-1">Total Pending Fines</p>
              <p className="text-sm text-red-100 mt-2">
                {rentals.filter(r => r.fineStatus === 'pending').length} overdue rental(s)
              </p>
            </div>
            <div className="p-4 bg-white/20 rounded-lg">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Rentals List */}
        {rentals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Fines!</h3>
            <p className="text-gray-600 mb-6">You have no overdue rentals or unpaid fines.</p>
            <Link
              to="/catalog"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rentals.map((rental) => (
              <div key={rental._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Book Cover */}
                    <img
                      src={rental.book?.coverImage || 'https://via.placeholder.com/100x150?text=No+Image'}
                      alt={rental.book?.title}
                      className="w-20 h-28 object-cover rounded-lg"
                    />

                    {/* Rental Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{rental.book?.title}</h3>
                          <p className="text-sm text-gray-600">{rental.book?.author}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            rental.status === 'overdue'
                              ? 'bg-red-100 text-red-800'
                              : rental.status === 'returned'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {rental.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Rental ID</p>
                          <p className="text-sm font-semibold text-gray-900">{rental.rentalNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Due Date</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(rental.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Days Overdue</p>
                          <p className={`text-sm font-bold ${getDaysOverdueColor(rental.overdueDays)}`}>
                            {rental.overdueDays} days
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Rental Amount</p>
                          <p className="text-sm font-semibold text-gray-900">
                            Rs. {rental.totalRentalAmount?.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Fine Section */}
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-red-800">Late Fee</p>
                            <p className="text-2xl font-bold text-red-600">
                              Rs. {rental.fineAmount?.toFixed(2)}
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              @ Rs. {rental.finePerDay}/day × {rental.overdueDays} days
                            </p>
                          </div>
                          {rental.fineStatus === 'pending' ? (
                            <button
                              onClick={() => openPaymentModal(rental)}
                              disabled={payingFine === rental._id}
                              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                            >
                              {payingFine === rental._id ? 'Processing...' : 'Pay Fine'}
                            </button>
                          ) : (
                            <div className="text-right">
                              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
                                ✓ Paid
                              </span>
                              {rental.finePaidDate && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {new Date(rental.finePaidDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Total Amount Due:</span>
                        <span className="text-lg font-bold text-gray-900">
                          Rs. {((rental.totalRentalAmount || 0) + (rental.fineAmount || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedRental && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Pay Fine</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Book:</p>
              <p className="font-semibold text-gray-900">{selectedRental.book?.title}</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 mb-1">Fine Amount</p>
              <p className="text-3xl font-bold text-red-600">Rs. {selectedRental.fineAmount?.toFixed(2)}</p>
              <p className="text-xs text-red-600 mt-1">
                {selectedRental.overdueDays} days overdue × Rs. {selectedRental.finePerDay}/day
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
              <div className="space-y-2">
                <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                  paymentMethod === 'cash_on_delivery' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="finePaymentMethod"
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-lg mr-2">💵</span>
                  <span className="text-sm font-medium text-gray-800">Cash on Delivery</span>
                </label>

                <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                  paymentMethod === 'khalti' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="finePaymentMethod"
                    value="khalti"
                    checked={paymentMethod === 'khalti'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-lg mr-2">🟣</span>
                  <span className="text-sm font-medium text-gray-800">Khalti</span>
                  <span className="ml-auto text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </label>

                <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                  paymentMethod === 'bank_transfer' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="finePaymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-lg mr-2">🏦</span>
                  <span className="text-sm font-medium text-gray-800">Bank Transfer</span>
                </label>
              </div>

              {paymentMethod === 'khalti' && (
                <p className="text-xs text-purple-600 mt-2 p-2 bg-purple-50 rounded">
                  You will be redirected to Khalti to complete the payment.
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePayFine}
                disabled={payingFine}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 ${
                  paymentMethod === 'khalti'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {payingFine
                  ? 'Processing...'
                  : paymentMethod === 'khalti'
                  ? 'Pay with Khalti'
                  : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinePaymentPage;
