import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RewardsPage = () => {
  const [rewardStatus, setRewardStatus] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemingReward, setRedeemingReward] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // Fetch reward status and transactions
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        // Fetch reward status
        const statusResponse = await axios.get('http://localhost:5001/api/rewards/status', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statusResponse.data.success) {
          setRewardStatus(statusResponse.data.data);
        }

        // Fetch transaction history
        const transactionsResponse = await axios.get('http://localhost:5001/api/rewards/transactions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (transactionsResponse.data.success) {
          setTransactions(transactionsResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching rewards data:', error);
        if (error.response?.status === 401) {
          alert('Session expired. Please login again.');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  // Redeem free book
  const handleRedeemFreeBook = async () => {
    if (!window.confirm('Redeem 200 points for a free book? You can use it in your next purchase.')) {
      return;
    }

    setRedeemingReward(true);
    try {
      const response = await axios.post(
        'http://localhost:5001/api/rewards/redeem-free-book',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        alert(response.data.message);
        // Refresh data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error redeeming free book:', error);
      alert(error.response?.data?.message || 'Failed to redeem free book');
    } finally {
      setRedeemingReward(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/catalog" className="flex items-center space-x-2">
              <span className="text-3xl">📚</span>
              <span className="text-2xl font-bold text-blue-600">Bookify</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/catalog" className="text-gray-700 hover:text-blue-600 font-medium">
                Catalog
              </Link>
              <Link to="/cart" className="text-gray-700 hover:text-blue-600 font-medium">
                Cart
              </Link>
              <Link to="/rewards" className="text-blue-600 font-semibold">
                Rewards
              </Link>
              <Link to="/orders" className="text-gray-700 hover:text-blue-600 font-medium">
                Orders
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <span className="text-gray-700 hidden sm:inline">
                Hi, {user.fullName || 'User'}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">🎁 Rewards Program</h1>

          {/* Rewards Overview Card */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 mb-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Your Points Balance</h2>
                <p className="text-purple-100">Earn points with every purchase and rental!</p>
              </div>
              <div className="text-6xl font-bold">{rewardStatus?.points || 0}</div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-purple-100 text-sm mb-1">Total Earned</div>
                <div className="text-2xl font-bold">{rewardStatus?.totalPointsEarned || 0}</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-purple-100 text-sm mb-1">Total Redeemed</div>
                <div className="text-2xl font-bold">{rewardStatus?.totalPointsRedeemed || 0}</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-purple-100 text-sm mb-1">Free Books</div>
                <div className="text-2xl font-bold">{rewardStatus?.totalFreeBookRedeemed || 0}</div>
              </div>
            </div>

            {/* Active Rewards */}
            {rewardStatus?.activeFreeBookRewards > 0 && (
              <div className="bg-green-500 text-white rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">✨ {rewardStatus.activeFreeBookRewards} Free Book{rewardStatus.activeFreeBookRewards > 1 ? 's' : ''} Available!</p>
                    <p className="text-green-100 text-sm">Use during checkout to get one book for free</p>
                  </div>
                  <Link
                    to="/catalog"
                    className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            )}

            {/* Progress to Next Reward */}
            {!rewardStatus?.canRedeemFreeBook && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-purple-100">Progress to Free Book</span>
                  <span className="font-semibold">{rewardStatus?.points || 0} / 200 points</span>
                </div>
                <div className="w-full bg-purple-900/30 rounded-full h-3">
                  <div 
                    className="bg-white h-3 rounded-full transition-all duration-500"
                    style={{ width: `${((rewardStatus?.points || 0) / 200) * 100}%` }}
                  ></div>
                </div>
                <p className="text-purple-100 text-sm mt-2">
                  {rewardStatus?.pointsNeededForFreeBook || 200} more points needed
                </p>
              </div>
            )}

            {/* Redeem Button */}
            {rewardStatus?.canRedeemFreeBook && rewardStatus?.activeFreeBookRewards === 0 && (
              <button
                onClick={handleRedeemFreeBook}
                disabled={redeemingReward}
                className="w-full bg-white text-purple-600 py-3 rounded-lg font-bold text-lg hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {redeemingReward ? 'Redeeming...' : '🎉 Redeem Free Book (200 points)'}
              </button>
            )}
          </div>

          {/* How to Earn Points */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">How to Earn Points</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🛒</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Purchase Books</h4>
                  <p className="text-gray-600 text-sm">Earn 10 points per book purchased</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📖</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Rent Books</h4>
                  <p className="text-gray-600 text-sm">Earn 5 points per book rented</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h3>
            
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500 mb-4">No transactions yet</p>
                <Link
                  to="/catalog"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'earned' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'earned' ? '+' : '-'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.reason}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                      </p>
                      <p className="text-sm text-gray-500">
                        Balance: {transaction.balanceAfter}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
