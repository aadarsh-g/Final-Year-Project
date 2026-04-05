import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(response.data.wishlist || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (bookId) => {
    try {
      setRemoving(bookId);
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/wishlist/remove/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(wishlist.filter(item => item.book._id !== bookId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove from wishlist');
    } finally {
      setRemoving(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5001/api/wishlist/clear', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist([]);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      alert('Failed to clear wishlist');
    }
  };

  const handleAddToCart = async (book) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5001/api/cart/add',
        {
          bookId: book._id,
          type: 'purchase',
          quantity: 1,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`"${book.title}" added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wishlist...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-sm text-gray-600">{wishlist.length} item(s)</p>
              </div>
            </div>

            {wishlist.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Your Wishlist is Empty</h3>
            <p className="text-gray-600 mb-6">Start adding books you love to your wishlist!</p>
            <Link
              to="/catalog"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-medium"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.book._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group"
              >
                <div className="relative">
                  <img
                    src={item.book.coverImage || 'https://via.placeholder.com/300x400?text=No+Image'}
                    alt={item.book.title}
                    className="w-full h-64 object-cover"
                  />
                  <button
                    onClick={() => handleRemove(item.book._id)}
                    disabled={removing === item.book._id}
                    className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-red-50 rounded-full shadow-lg transition"
                    title="Remove from wishlist"
                  >
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                    </svg>
                  </button>
                  
                  {!item.book.isActive && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold">
                        Unavailable
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <Link
                    to={`/book/${item.book._id}`}
                    className="block hover:text-blue-600 transition"
                  >
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                      {item.book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{item.book.author}</p>
                  </Link>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {item.book.category}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      Rs. {item.book.price?.purchase || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">
                      Stock: {item.book.stock?.available || 0}/{item.book.stock?.total || 0}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mb-3">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddToCart(item.book)}
                      disabled={!item.book.isActive || item.book.stock?.available === 0}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      Add to Cart
                    </button>
                    <Link
                      to={`/book/${item.book._id}`}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WishlistPage;
