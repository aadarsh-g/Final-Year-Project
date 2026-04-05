import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

function AdminFineManagement() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, paid
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPendingFines();
  }, []);

  const fetchPendingFines = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/rentals/pending-fines', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRentals(response.data.rentals || []);
    } catch (error) {
      console.error('Error fetching pending fines:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = 
      rental.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.rentalNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'pending') return matchesSearch && rental.fineStatus === 'pending';
    if (filter === 'paid') return matchesSearch && rental.fineStatus === 'paid';
    return matchesSearch;
  });

  const totalPendingFines = rentals
    .filter(r => r.fineStatus === 'pending')
    .reduce((sum, r) => sum + (r.fineAmount || 0), 0);

  const totalPaidFines = rentals
    .filter(r => r.fineStatus === 'paid')
    .reduce((sum, r) => sum + (r.fineAmount || 0), 0);

  if (loading) {
    return (
      <AdminLayout title="Fine Management" subtitle="Track and manage rental fines">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Fine Management" subtitle="Track and manage rental fines">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm mb-1">Total Pending Fines</p>
              <p className="text-3xl font-bold">Rs. {totalPendingFines.toFixed(2)}</p>
              <p className="text-red-100 text-xs mt-2">
                {rentals.filter(r => r.fineStatus === 'pending').length} overdue rental(s)
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Total Paid Fines</p>
              <p className="text-3xl font-bold">Rs. {totalPaidFines.toFixed(2)}</p>
              <p className="text-green-100 text-xs mt-2">
                {rentals.filter(r => r.fineStatus === 'paid').length} payment(s)
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Rentals</p>
              <p className="text-3xl font-bold">{rentals.length}</p>
              <p className="text-blue-100 text-xs mt-2">With late fees</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({rentals.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'pending'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({rentals.filter(r => r.fineStatus === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'paid'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Paid ({rentals.filter(r => r.fineStatus === 'paid').length})
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search rentals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Rentals Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rental ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Overdue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fine Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No rentals found
                  </td>
                </tr>
              ) : (
                filteredRentals.map((rental) => (
                  <tr key={rental._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rental.rentalNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{rental.user?.fullName}</div>
                      <div className="text-xs text-gray-500">{rental.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{rental.book?.title}</div>
                      <div className="text-xs text-gray-500">{rental.book?.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(rental.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${
                        rental.overdueDays >= 10 ? 'text-red-600' :
                        rental.overdueDays >= 5 ? 'text-orange-600' :
                        'text-yellow-600'
                      }`}>
                        {rental.overdueDays} days
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-red-600">
                        Rs. {rental.fineAmount?.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        @ Rs. {rental.finePerDay}/day
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          rental.fineStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {rental.fineStatus === 'paid' ? '✓ Paid' : 'Pending'}
                      </span>
                      {rental.finePaidDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(rental.finePaidDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminFineManagement;
