import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CartIcon = () => {
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  // Fetch cart count
  const fetchCartCount = async () => {
    if (!userId) return;
    
    try {
      const response = await axios.get(`http://localhost:5001/api/cart/count?userId=${userId}`);
      if (response.data.success) {
        setCartCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  // Navigate to cart page
  const handleClick = () => {
    navigate('/cart');
  };

  // Fetch cart count on mount and set up polling
  useEffect(() => {
    if (!userId) return;
    
    fetchCartCount();
    
    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchCartCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [userId]);

  // Listen for cart update events
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cart-updated', handleCartUpdate);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, [userId]);

  if (!userId) return null;

  return (
    <button
      onClick={handleClick}
      className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
    >
      {/* Shopping Cart Icon */}
      <svg 
        className="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
        />
      </svg>
      
      {/* Item Count Badge */}
      {cartCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-blue-600 rounded-full min-w-[20px]">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon;
