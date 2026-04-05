import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [rewardStatus, setRewardStatus] = useState(null);
  const [redeemingReward, setRedeemingReward] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user._id || user.id;
  const token = localStorage.getItem('token');

  // Fetch cart
  const fetchCart = async () => {
    if (!userId) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5001/api/cart?userId=${userId}`);
      if (response.data.success) {
        setCart(response.data.cart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reward status
  const fetchRewardStatus = async () => {
    if (!userId || !token) return;
    
    try {
      const response = await axios.get('http://localhost:5001/api/rewards/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setRewardStatus(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reward status:', error);
    }
  };

  // Redeem free book
  const handleRedeemFreeBook = async () => {
    if (!token) {
      alert('Please login to redeem rewards');
      return;
    }

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
        fetchRewardStatus(); // Refresh reward status
      }
    } catch (error) {
      console.error('Error redeeming free book:', error);
      alert(error.response?.data?.message || 'Failed to redeem free book');
    } finally {
      setRedeemingReward(false);
    }
  };

  // Remove item
  const removeItem = async (itemId) => {
    if (!window.confirm('Remove this item from cart?')) return;

    setUpdating(true);
    try {
      const response = await axios.delete(
        `http://localhost:5001/api/cart/remove/${itemId}`,
        { data: { userId } }
      );
      if (response.data.success) {
        setCart(response.data.cart);
        window.dispatchEvent(new Event('cart-updated'));
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert(error.response?.data?.message || 'Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  // Update quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdating(true);
    try {
      const response = await axios.put(
        `http://localhost:5001/api/cart/update-quantity/${itemId}`,
        { userId, quantity: newQuantity }
      );
      if (response.data.success) {
        setCart(response.data.cart);
        window.dispatchEvent(new Event('cart-updated'));
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert(error.response?.data?.message || 'Failed to update quantity');
      fetchCart(); // Refresh to get correct state
    } finally {
      setUpdating(false);
    }
  };

  // Update rental dates
  const updateRentalDates = async (itemId, rentStartDate, rentEndDate) => {
    if (!rentStartDate || !rentEndDate) {
      alert('Please select both start and end dates');
      return;
    }

    const start = new Date(rentStartDate);
    const end = new Date(rentEndDate);

    if (end <= start) {
      alert('Return date must be after start date');
      return;
    }

    setUpdating(true);
    try {
      const response = await axios.put(
        `http://localhost:5001/api/cart/update-duration/${itemId}`,
        { userId, rentStartDate, rentEndDate }
      );
      if (response.data.success) {
        setCart(response.data.cart);
        window.dispatchEvent(new Event('cart-updated'));
      }
    } catch (error) {
      console.error('Error updating rental dates:', error);
      alert(error.response?.data?.message || 'Failed to update rental dates');
    } finally {
      setUpdating(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) return;

    setUpdating(true);
    try {
      const response = await axios.delete(
        'http://localhost:5001/api/cart/clear',
        { data: { userId } }
      );
      if (response.data.success) {
        setCart(response.data.cart);
        window.dispatchEvent(new Event('cart-updated'));
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart');
    } finally {
      setUpdating(false);
    }
  };

  // Proceed to checkout
  const proceedToCheckout = async () => {
    navigate('/checkout');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    fetchCart();
    fetchRewardStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 md:h-20">
              <Link to="/catalog" className="flex items-center space-x-2">
                <div className="flex flex-col">
                  <div className="w-6 h-6 bg-green-500 rounded-sm mb-0.5"></div>
                  <div className="w-6 h-5 bg-orange-500 rounded-sm mb-0.5"></div>
                  <div className="w-6 h-4 bg-red-500 rounded-sm"></div>
                </div>
                <span className="text-xl md:text-2xl font-bold text-gray-800">Bookify</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            {cart && cart.items.length > 0 && (
              <button
                onClick={clearCart}
                disabled={updating}
                className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
              >
                Clear Cart
              </button>
            )}
          </div>

          {!cart || cart.items.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Add some books to get started!</p>
              <Link 
                to="/catalog" 
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Browse Books
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.items.map((item) => (
                  <div key={item._id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start space-x-4">
                      {/* Book Cover */}
                      <img
                        src={item.bookId?.coverImage || 'https://via.placeholder.com/96x128?text=No+Cover'}
                        alt={item.bookId?.title || 'Book'}
                        className="w-20 h-28 object-cover rounded flex-shrink-0"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/96x128?text=No+Cover'}
                      />
                      
                      <div className="flex-1 min-w-0">
                        {/* Book Title & Author */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.bookId?.title || 'Unknown Title'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          by {item.bookId?.author || 'Unknown Author'}
                        </p>
                        
                        {/* Type Badge */}
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                          item.type === 'purchase' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.type === 'purchase' ? '📦 Purchase' : '📚 Rental'}
                        </span>

                        {/* Quantity/Duration Controls */}
                        {item.type === 'purchase' ? (
                          <div className="flex items-center space-x-3 mb-4">
                            <label className="text-sm font-medium text-gray-700">Quantity:</label>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                disabled={updating || item.quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <span className="text-lg font-semibold">−</span>
                              </button>
                              <span className="w-12 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                disabled={updating}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                              >
                                <span className="text-lg font-semibold">+</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Rental Period</p>
                            
                            {/* Display Current Rental Dates */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-600 text-xs mb-1">Start Date</p>
                                  <p className="font-semibold text-gray-900">
                                    {item.rentStartDate ? new Date(item.rentStartDate).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    }) : 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600 text-xs mb-1">Return Date</p>
                                  <p className="font-semibold text-gray-900">
                                    {item.rentEndDate ? new Date(item.rentEndDate).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    }) : 'N/A'}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-blue-200">
                                <p className="text-xs text-blue-700">
                                  <span className="font-semibold">{item.rentalDuration} {item.rentalDuration === 1 ? 'day' : 'days'}</span> × Rs. 50/day
                                </p>
                              </div>
                            </div>

                            {/* Edit Dates - Collapsible */}
                            <details className="group">
                              <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium list-none flex items-center">
                                <svg className="w-4 h-4 mr-1 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Change Dates
                              </summary>
                              <div className="mt-3 space-y-2">
                                <div>
                                  <label className="text-xs text-gray-600 block mb-1">New Start Date</label>
                                  <input
                                    type="date"
                                    id={`start-${item._id}`}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={updating}
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600 block mb-1">New Return Date</label>
                                  <input
                                    type="date"
                                    id={`end-${item._id}`}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={updating}
                                  />
                                </div>
                                <button
                                  onClick={() => {
                                    const startInput = document.getElementById(`start-${item._id}`);
                                    const endInput = document.getElementById(`end-${item._id}`);
                                    if (startInput.value && endInput.value) {
                                      updateRentalDates(item._id, startInput.value, endInput.value);
                                    } else {
                                      alert('Please select both dates');
                                    }
                                  }}
                                  disabled={updating}
                                  className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                                >
                                  {updating ? 'Updating...' : 'Update Dates'}
                                </button>
                              </div>
                            </details>
                          </div>
                        )}

                        {/* Price & Remove Button */}
                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-xl font-bold text-gray-900">
                            Rs. {item.subtotal.toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(item._id)}
                            disabled={updating}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                  
                  {/* Summary Details */}
                  <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'})</span>
                      <span className="font-medium">Rs. {cart.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                    <span>Total</span>
                    <span>Rs. {cart.totalAmount.toFixed(2)}</span>
                  </div>

                  {/* Reward Points Section */}
                  {rewardStatus && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">🎁</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Reward Points</p>
                            <p className="text-xs text-gray-600">Earn 10 pts/purchase, 5 pts/rental</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-purple-600">{rewardStatus.points}</span>
                      </div>
                      
                      {rewardStatus.activeFreeBookRewards > 0 && (
                        <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-center">
                          <p className="text-sm font-semibold text-green-800">
                            ✨ {rewardStatus.activeFreeBookRewards} Free Book{rewardStatus.activeFreeBookRewards > 1 ? 's' : ''} Available!
                          </p>
                          <p className="text-xs text-green-700">Apply during checkout</p>
                        </div>
                      )}
                      
                      {rewardStatus.canRedeemFreeBook && rewardStatus.activeFreeBookRewards === 0 && (
                        <button
                          onClick={handleRedeemFreeBook}
                          disabled={redeemingReward}
                          className="w-full mt-2 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105"
                        >
                          {redeemingReward ? 'Redeeming...' : '🎉 Redeem Free Book (200 pts)'}
                        </button>
                      )}
                      
                      {!rewardStatus.canRedeemFreeBook && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>{rewardStatus.points} / 200 points</span>
                            <span>{rewardStatus.pointsNeededForFreeBook} more needed</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                              style={{ width: `${(rewardStatus.points / 200) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Checkout Button */}
                  <button
                    onClick={proceedToCheckout}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition mb-4"
                  >
                    Proceed to Checkout
                  </button>

                  <Link 
                    to="/catalog" 
                    className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ← Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
