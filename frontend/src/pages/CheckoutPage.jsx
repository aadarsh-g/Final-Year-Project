import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [rewardStatus, setRewardStatus] = useState(null);
  const [selectedFreeBook, setSelectedFreeBook] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user._id || user.id;
  const token = localStorage.getItem('token');

  // Form state
  const [formData, setFormData] = useState({
    // Customer Info
    fullName: user.fullName || '',
    email: user.email || '',
    phone: '',
    
    // Shipping Address
    city: '',
    country: 'Nepal',
    
    // Payment
    paymentMethod: 'cash_on_delivery',
    
    // Notes
    customerNotes: '',
  });

  const [errors, setErrors] = useState({});

  // Fetch cart
  useEffect(() => {
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
          
          // If cart is empty, redirect to cart page
          if (!response.data.cart || response.data.cart.items.length === 0) {
            navigate('/cart');
          }
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        alert('Failed to load cart');
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };

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

    fetchCart();
    fetchRewardStatus();
  }, [userId, navigate]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Calculate adjusted total with free book reward
  const calculateAdjustedTotal = () => {
    if (!cart || !selectedFreeBook || !rewardStatus?.activeFreeBookRewards) {
      return cart?.finalAmount || 0;
    }

    const freeBookItem = cart.items.find(item => item._id === selectedFreeBook);
    if (!freeBookItem) {
      return cart.finalAmount;
    }

    // Only one unit gets free, not the entire item
    const pricePerUnit = freeBookItem.type === 'purchase' 
      ? freeBookItem.bookId.price.purchase 
      : freeBookItem.bookId.price.rental.perDay * freeBookItem.rentalDuration;
    
    return Math.max(0, cart.finalAmount - pricePerUnit);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Customer Info
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    // Shipping Address
    if (!formData.city.trim()) newErrors.city = 'City is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle checkout
  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('Please fix all errors before proceeding');
      return;
    }

    // Check if user has free book reward but hasn't selected a book
    if (rewardStatus?.activeFreeBookRewards > 0 && !selectedFreeBook) {
      if (!window.confirm('You have a free book reward available but haven\'t selected a book. Continue without using it?')) {
        return;
      }
    }

    setProcessing(true);

    const shippingAddress = {
      street: 'N/A',
      city: formData.city,
      state: 'N/A',
      zipCode: '00000',
      country: formData.country,
    };
    const customerInfo = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
    };
    const freeBookReward = selectedFreeBook
      ? { itemId: selectedFreeBook, bookId: cart.items.find(i => i._id === selectedFreeBook)?.bookId?._id }
      : null;

    try {
      if (formData.paymentMethod === 'khalti') {
        // Khalti flow — create order on backend, then redirect to Khalti portal
        const response = await axios.post(
          'http://localhost:5001/api/khalti/initiate-checkout',
          { userId, customerInfo, shippingAddress, customerNotes: formData.customerNotes, freeBookReward },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          window.dispatchEvent(new Event('cart-updated'));
          // Redirect to Khalti payment portal
          window.location.href = response.data.paymentUrl;
        }
      } else {
        // Cash on Delivery flow
        const checkoutData = {
          userId,
          customerInfo,
          shippingAddress,
          paymentMethod: formData.paymentMethod,
          customerNotes: formData.customerNotes,
          freeBookReward,
        };

        const response = await axios.post(
          'http://localhost:5001/api/checkout/checkout',
          checkoutData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          alert(`Order placed successfully! Order #${response.data.order.orderNumber}`);
          window.dispatchEvent(new Event('cart-updated'));
          navigate('/orders');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
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

            <div className="flex items-center space-x-4">
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

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Cart</span>
            </div>
            <div className="w-16 h-0.5 bg-blue-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Checkout</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-400">Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          <form onSubmit={handleCheckout}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.fullName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="John Doe"
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="(555) 123-4567"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Location</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Kathmandu"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
                  <div className="space-y-3">
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.paymentMethod === 'cash_on_delivery'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={formData.paymentMethod === 'cash_on_delivery'}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-3 text-2xl">💵</span>
                      <div className="ml-2">
                        <span className="text-gray-900 font-medium block">Cash on Delivery</span>
                        <span className="text-xs text-gray-500">Pay with cash when your order is delivered</span>
                      </div>
                    </label>

                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.paymentMethod === 'khalti'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="khalti"
                        checked={formData.paymentMethod === 'khalti'}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="ml-3 text-2xl">🟣</span>
                      <div className="ml-2">
                        <span className="text-gray-900 font-medium block">Khalti</span>
                        <span className="text-xs text-gray-500">Pay securely via Khalti digital wallet</span>
                      </div>
                      <span className="ml-auto text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    </label>

                    {formData.paymentMethod === 'khalti' && (
                      <div className="ml-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-700">
                        You will be redirected to the Khalti payment portal to complete your purchase.
                        Test credentials — ID: <strong>9800000000</strong>, MPIN: <strong>1111</strong>, OTP: <strong>987654</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Notes */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Order Notes (Optional)</h2>
                  <textarea
                    name="customerNotes"
                    value={formData.customerNotes}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any special instructions for your order..."
                    maxLength="500"
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.customerNotes.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                  
                  {/* Items */}
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {cart?.items.map((item) => (
                      <div key={item._id} className="flex space-x-3">
                        <img
                          src={item.bookId?.coverImage || 'https://via.placeholder.com/60x80?text=Book'}
                          alt={item.bookId?.title || 'Book'}
                          className="w-12 h-16 object-cover rounded flex-shrink-0"
                          onError={(e) => e.target.src = 'https://via.placeholder.com/60x80?text=Book'}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.bookId?.title || 'Unknown'}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {item.type === 'purchase' 
                              ? `Qty: ${item.quantity}` 
                              : `Rental: ${item.rentalDuration} days`}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            Rs. {item.subtotal.toFixed(2)}
                          </p>
                          
                          {/* Free Book Selector */}
                          {rewardStatus?.activeFreeBookRewards > 0 && item.type === 'purchase' && (
                            <label className="flex items-center mt-1 cursor-pointer">
                              <input
                                type="radio"
                                name="freeBook"
                                checked={selectedFreeBook === item._id}
                                onChange={() => setSelectedFreeBook(item._id)}
                                className="mr-1 cursor-pointer"
                              />
                              <span className="text-xs text-purple-600 font-semibold">Apply Free Book 🎁</span>
                            </label>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Free Book Reward Banner */}
                  {rewardStatus?.activeFreeBookRewards > 0 && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                      <p className="text-xs font-semibold text-purple-800 mb-1">
                        🎉 {rewardStatus.activeFreeBookRewards} Free Book Reward{rewardStatus.activeFreeBookRewards > 1 ? 's' : ''} Available!
                      </p>
                      <p className="text-xs text-purple-600">
                        {selectedFreeBook 
                          ? '✅ Free book selected! One book will be Rs. 0' 
                          : 'Select one purchase item above to make it free'}
                      </p>
                    </div>
                  )}

                  {/* Late fine notice — shown only when cart has a rental */}
                  {cart?.items?.some(i => i.type === 'rental') && (
                    <div className="flex items-start space-x-2 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 mb-3">
                      <span className="text-amber-500 text-sm mt-0.5">⚠️</span>
                      <p className="text-xs text-amber-800 leading-snug">
                        <strong>Late return fine:</strong> Rs. 100/day will be charged for every day past the return date.
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-4 space-y-2 mb-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium">Rs. {cart?.totalAmount.toFixed(2)}</span>
                    </div>
                    
                    {cart?.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({cart.discountCode})</span>
                        <span className="font-medium">-Rs. {cart.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {selectedFreeBook && rewardStatus?.activeFreeBookRewards > 0 && (
                      <div className="flex justify-between text-purple-600">
                        <span>Free Book Reward 🎁</span>
                        <span className="font-medium">-Rs. {(() => {
                          const freeItem = cart.items.find(item => item._id === selectedFreeBook);
                          if (!freeItem) return '0.00';
                          const price = freeItem.type === 'purchase' 
                            ? freeItem.bookId.price.purchase 
                            : freeItem.bookId.price.rental.perDay * freeItem.rentalDuration;
                          return price.toFixed(2);
                        })()}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="font-medium text-green-600">FREE</span>
                    </div>
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>Rs. {calculateAdjustedTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className={`w-full py-3 text-white rounded-lg font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed mb-3 ${
                      formData.paymentMethod === 'khalti'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {processing
                      ? 'Processing...'
                      : formData.paymentMethod === 'khalti'
                      ? 'Pay with Khalti'
                      : 'Place Order'}
                  </button>

                  <Link
                    to="/cart"
                    className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ← Back to Cart
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
