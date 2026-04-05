import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function WishlistIcon() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchWishlistCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchWishlistCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchWishlistCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:5001/api/wishlist/count', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
    }
  };

  return (
    <Link
      to="/wishlist"
      className="relative p-2 text-gray-700 hover:text-red-600 transition"
      title="Wishlist"
    >
      <svg
        className="w-6 h-6"
        fill={count > 0 ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

export default WishlistIcon;
