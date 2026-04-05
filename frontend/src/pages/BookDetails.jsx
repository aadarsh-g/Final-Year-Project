import { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState("buy"); // 'buy' or 'rent'
  const [rentStartDate, setRentStartDate] = useState('');
  const [rentEndDate, setRentEndDate] = useState('');
  const [rentalDays, setRentalDays] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description"); // description, reviews, details

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [editHover, setEditHover] = useState(0);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  const currentUserId = useMemo(() => {
    const u = authUser || (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "{}");
      } catch {
        return null;
      }
    })();
    if (!u) return null;
    return u.id || u._id;
  }, [authUser]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isReviewMine = (r) => currentUserId && String(r.user) === String(currentUserId);
  const myReview = reviews.find(isReviewMine);

  // Fetch book details from API
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5001/api/books/${id}`);
        setBook(response.data.book);

        // Fetch reviews
        try {
          const revRes = await axios.get(`http://localhost:5001/api/books/${id}/reviews`);
          setReviews(revRes.data.reviews || []);
        } catch (_) { /* reviews non-critical */ }

        // Fetch related books (same category)
        if (response.data.book?.category) {
          const relatedResponse = await axios.get("http://localhost:5001/api/books", {
            params: {
              category: response.data.book.category,
              isActive: 'true',
              limit: 4
            }
          });
          // Filter out current book and limit to 3
          const filtered = relatedResponse.data.books
            .filter(b => b._id !== id)
            .slice(0, 3);
          setRelatedBooks(filtered);
        }
      } catch (error) {
        console.error('Error fetching book details:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        
        // Set book to null to trigger "not found" page
        setBook(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  // Calculate rental days when dates change
  useEffect(() => {
    if (rentStartDate && rentEndDate) {
      const start = new Date(rentStartDate);
      const end = new Date(rentEndDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setRentalDays(diffDays);
    } else {
      setRentalDays(0);
    }
  }, [rentStartDate, rentEndDate]);

  // Update page title dynamically
  useEffect(() => {
    if (book?.title) {
      document.title = `${book.title} - Bookify`;
    } else {
      document.title = 'Book Details - Bookify';
    }
    
    // Cleanup: reset title when component unmounts
    return () => {
      document.title = 'Bookify';
    };
  }, [book]);

  // Sample book data (fallback - will be replaced by API data)
  const booksData = {
    1: {
      id: 1,
      title: "It Ends With Us",
      author: "Colleen Hoover",
      price: 600,
      rentPrice: 100,
      rating: 4.5,
      reviews: 234,
      totalReviews: 234,
      category: "Romance",
      image: "/images/It ends with us.jpg",
      isbn: "978-1501110368",
      pages: 384,
      publisher: "Atria Books",
      publishDate: "August 2, 2016",
      language: "English",
      availability: "In Stock",
      description:
        "Lily hasn't always had it easy, but that's never stopped her from working hard for the life she wants. She's come a long way from the small town where she grew up—she graduated from college, moved to Boston, and started her own business. And when she feels a spark with a gorgeous neurosurgeon named Ryle Kincaid, everything in Lily's life seems too good to be true.",
      features: [
        "Bestselling Romance Novel",
        "Over 1 million copies sold",
        "New York Times Bestseller",
        "Perfect for book clubs",
      ],
    },
    2: {
      id: 2,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      price: 500,
      rentPrice: 100,
      rating: 4.8,
      reviews: 456,
      totalReviews: 456,
      category: "Classic",
      image: "/images/The Great Gatsby.jpg",
      isbn: "978-0743273565",
      pages: 180,
      publisher: "Scribner",
      publishDate: "April 10, 1925",
      language: "English",
      availability: "In Stock",
      description:
        "The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.",
      features: [
        "American Classic Literature",
        "Required reading in schools",
        "Multiple award winner",
        "Adapted into films",
      ],
    },
  };


  // Calculate rental price based on days (Rs. 50 per day)
  const calculateRentalPrice = () => {
    return (rentalDays * 50).toFixed(2);
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get minimum end date (start date + 1 day)
  const getMinEndDate = () => {
    if (!rentStartDate) return getMinDate();
    const start = new Date(rentStartDate);
    start.setDate(start.getDate() + 1);
    return start.toISOString().split('T')[0];
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    if (reviewRating === 0) { setReviewError('Please select a star rating.'); return; }
    setReviewSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:5001/api/books/${id}/reviews`,
        { rating: reviewRating, comment: reviewComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews(prev => [res.data.review, ...prev]);
      setBook(prev => ({ ...prev, rating: res.data.rating }));
      setReviewRating(0);
      setReviewComment('');
      setReviewSuccess('Your review has been submitted!');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const startEditReview = (review) => {
    setEditError('');
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
    setEditHover(0);
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditError('');
  };

  const handleSaveEditReview = async (e) => {
    e.preventDefault();
    setEditError('');
    if (editRating < 1) {
      setEditError('Please select a star rating.');
      return;
    }
    setEditSubmitting(true);
    try {
      const t = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5001/api/books/${id}/reviews/${editingReviewId}`,
        { rating: editRating, comment: editComment },
        { headers: { Authorization: `Bearer ${t}` } }
      );
      setReviews((prev) =>
        prev.map((r) => (r._id === editingReviewId ? res.data.review : r))
      );
      setBook((prev) => ({ ...prev, rating: res.data.rating }));
      setEditingReviewId(null);
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update review.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleAddToCart = async () => {
    if (!book) return;
    
    // Validate rental dates if renting
    if (selectedOption === 'rent') {
      if (!rentStartDate || !rentEndDate) {
        alert('Please select rental start and end dates');
        return;
      }
      if (rentalDays < 1) {
        alert('Minimum rental period is 1 day');
        return;
      }
    }
    
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const requestData = {
        userId: user._id || user.id,
        bookId: book._id,
        type: selectedOption === 'buy' ? 'purchase' : 'rental',
        quantity: selectedOption === 'buy' ? quantity : undefined,
      };

      // Add rental dates if renting
      if (selectedOption === 'rent') {
        requestData.rentStartDate = rentStartDate;
        requestData.rentEndDate = rentEndDate;
      }

      const response = await axios.post(
        'http://localhost:5001/api/cart/add',
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Trigger cart update event
        window.dispatchEvent(new Event('cart-updated'));
        alert(`"${book.title}" added to cart!`);
        
        // Reset rental dates after adding
        if (selectedOption === 'rent') {
          setRentStartDate('');
          setRentEndDate('');
          setRentalDays(0);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5001/api/wishlist/add',
        { bookId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Trigger wishlist update event
      window.dispatchEvent(new Event('wishlist-updated'));
      alert('Added to wishlist!');
    } catch (error) {
      if (error.response?.data?.message === 'Book already in wishlist') {
        alert('This book is already in your wishlist!');
      } else {
        console.error('Error adding to wishlist:', error);
        alert(error.response?.data?.message || 'Failed to add to wishlist');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Not Found</h2>
          <p className="text-gray-600 mb-6">The book you're looking for doesn't exist.</p>
          <Link to="/catalog" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 md:h-20">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex flex-col">
                <div className="w-6 h-6 bg-green-500 rounded-sm mb-0.5"></div>
                <div className="w-6 h-5 bg-orange-500 rounded-sm mb-0.5"></div>
                <div className="w-6 h-4 bg-red-500 rounded-sm"></div>
              </div>
              <span className="text-xl md:text-2xl font-bold text-gray-800">
                Bookify
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/catalog" className="text-blue-600 hover:text-blue-700">
              Catalog
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{book.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Book Image */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-[2/3] bg-gray-200">
                  <img
                    src={book.coverImage || 'https://via.placeholder.com/400x600?text=No+Cover'}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x600?text=No+Cover';
                    }}
                  />
                </div>
              </div>

              {/* Quick Actions (Mobile) */}
              <div className="mt-6 lg:hidden">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Buy Price</p>
                      <p className="text-3xl font-bold text-gray-900">Rs. {book.price?.purchase || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Rent From</p>
                      <p className="text-2xl font-bold text-blue-600">Rs. {book.price?.rental?.perDay || 0}/day</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Book Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              {/* Title and Author */}
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {book.title}
                </h1>
                <p className="text-xl text-gray-600 mb-3">by {book.author}</p>

                {/* Rating */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(book.rating?.average || 0) ? "fill-current" : "fill-gray-300"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-700 font-medium">{book.rating?.average || 0}</span>
                  </div>
                  <span className="text-gray-500">|</span>
                  <Link to="#reviews" className="text-blue-600 hover:text-blue-700">
                    {book.rating?.count || 0} reviews
                  </Link>
                </div>
              </div>

              {/* Category and Availability */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {book.category}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  book.stock?.available > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {book.stock?.available > 0 ? `In Stock (${book.stock.available})` : 'Out of Stock'}
                </span>
              </div>

              {/* Purchase/Rental Options */}
              <div className="border-t border-b border-gray-200 py-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Your Option</h3>

                {/* Option Tabs */}
                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={() => setSelectedOption("buy")}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                      selectedOption === "buy"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Buy</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedOption("rent")}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                      selectedOption === "rent"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Rent</span>
                    </div>
                  </button>
                </div>

                {/* Buy Option Details */}
                {selectedOption === "buy" && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Purchase Price</p>
                        <p className="text-4xl font-bold text-gray-900">Rs. {book.price?.purchase || 0}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <label className="text-sm text-gray-700 font-medium">Quantity:</label>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-3 py-2 hover:bg-gray-100 transition"
                          >
                            -
                          </button>
                          <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="px-3 py-2 hover:bg-gray-100 transition"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Own it forever</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Free shipping on orders over Rs. 2500</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-lg font-semibold text-gray-700">Total:</span>
                      <span className="text-3xl font-bold text-gray-900">
                        Rs. {((book.price?.purchase || 0) * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Rent Option Details */}
                {selectedOption === "rent" && (
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-2">Rental Price</p>
                      <p className="text-2xl font-bold text-blue-600">Rs. 50/day</p>
                      <p className="text-xs text-gray-500 mt-1">Fixed daily rental rate</p>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📅 Rent Start Date *
                      </label>
                      <input
                        type="date"
                        value={rentStartDate}
                        onChange={(e) => setRentStartDate(e.target.value)}
                        min={getMinDate()}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📅 Return Date *
                      </label>
                      <input
                        type="date"
                        value={rentEndDate}
                        onChange={(e) => setRentEndDate(e.target.value)}
                        min={getMinEndDate()}
                        disabled={!rentStartDate}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                      />
                      {!rentStartDate && (
                        <p className="text-xs text-gray-500 mt-1">Please select start date first</p>
                      )}
                    </div>

                    {rentalDays > 0 && (
                      <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-900">
                            📆 Total Rental Period:
                          </span>
                          <span className="text-lg font-bold text-blue-900">
                            {rentalDays} {rentalDays === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Flexible rental period (minimum 1 day)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Easy return process</span>
                    </div>

                    {/* Late fine warning */}
                    <div className="flex items-start space-x-2 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 mb-5">
                      <span className="text-amber-500 text-base mt-0.5">⚠️</span>
                      <p className="text-xs text-amber-800 leading-snug">
                        <strong>Late return fine:</strong> Rs. 100/day will be charged for every day past the return date. Please return on time.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t-2 border-blue-200">
                      <div>
                        <span className="text-sm text-gray-600 block">Total Rental Cost:</span>
                        {rentalDays > 0 && (
                          <span className="text-xs text-gray-500">
                            ({rentalDays} {rentalDays === 1 ? 'day' : 'days'} × Rs. 50)
                          </span>
                        )}
                      </div>
                      <span className="text-3xl font-bold text-blue-600">
                        Rs. {rentalDays > 0 ? calculateRentalPrice() : '0.00'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full mt-6 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition duration-200 flex items-center justify-center space-x-2 text-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Add to Cart</span>
                </button>

                <button 
                  onClick={handleAddToWishlist}
                  className="w-full mt-3 py-3 border-2 border-red-300 hover:border-red-400 hover:bg-red-50 text-red-600 font-medium rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Add to Wishlist</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="mb-6">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("description")}
                    className={`px-6 py-3 font-medium ${
                      activeTab === "description"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`px-6 py-3 font-medium ${
                      activeTab === "details"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`px-6 py-3 font-medium ${
                      activeTab === "reviews"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Reviews ({book.rating?.count || 0})
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div>
                {activeTab === "description" && (
                  <div>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {book.description || 'No description available for this book.'}
                    </p>
                    {book.genre && book.genre.length > 0 && (
                      <>
                        <h4 className="font-semibold text-gray-900 mb-3">Genres:</h4>
                        <ul className="space-y-2">
                          {book.genre.map((genre, index) => (
                            <li key={index} className="flex items-start">
                              <svg
                                className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span className="text-gray-700">{genre}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">ISBN:</span>
                      <span className="text-gray-900 font-medium">{book.isbn}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">Pages:</span>
                      <span className="text-gray-900 font-medium">{book.pages}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">Publisher:</span>
                      <span className="text-gray-900 font-medium">{book.publisher}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">Publish Date:</span>
                      <span className="text-gray-900 font-medium">
                        {book.publishedDate ? new Date(book.publishedDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">Language:</span>
                      <span className="text-gray-900 font-medium">{book.language}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">Category:</span>
                      <span className="text-gray-900 font-medium">{book.category}</span>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div id="reviews">
                    <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
                      <div className="text-4xl font-bold text-gray-900">{book.rating?.average ?? 0}</div>
                      <div>
                        <div className="flex text-yellow-400 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(book.rating?.average || 0) ? "fill-current" : "fill-gray-300"
                              }`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">{book.rating?.count || 0} review{(book.rating?.count || 0) !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {token && !myReview && (
                    <form onSubmit={handleSubmitReview} className="mb-8 space-y-3">
                      <p className="text-sm font-medium text-gray-800">Your rating</p>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setReviewHover(star)}
                            onMouseLeave={() => setReviewHover(0)}
                            className="focus:outline-none"
                            aria-label={`${star} star${star > 1 ? 's' : ''}`}
                          >
                            <svg
                              className={`w-8 h-8 transition-colors ${
                                star <= (reviewHover || reviewRating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300 fill-current'
                              }`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                      </div>

                        <textarea
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          placeholder="Write your review (optional)"
                          rows={3}
                          maxLength={1000}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                        />

                        {reviewError && <p className="text-red-500 text-xs mt-1">{reviewError}</p>}
                        {reviewSuccess && <p className="text-green-600 text-xs mt-1">{reviewSuccess}</p>}

                        <button
                          type="submit"
                          disabled={reviewSubmitting}
                          className="mt-3 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition"
                        >
                          {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
                        </button>
                    </form>
                    )}
                    {token && myReview && !editingReviewId && (
                      <p className="text-sm text-gray-600 mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        You already reviewed this book. Use <strong>Edit</strong> on your review below to update it.
                      </p>
                    )}

                    {/* Review list */}
                    {reviews.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <p className="font-medium text-gray-500">No reviews yet</p>
                        <p className="text-sm mt-1">Be the first to share your thoughts on this book.</p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {reviews.map((review) => (
                          <div key={review._id} className="border-b border-gray-200 pb-5">
                            {editingReviewId === review._id ? (
                              <form onSubmit={handleSaveEditReview} className="space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-sm font-medium text-gray-800">Edit your review</p>
                                <div className="flex items-center gap-1">
                                  {[1,2,3,4,5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setEditRating(star)}
                                      onMouseEnter={() => setEditHover(star)}
                                      onMouseLeave={() => setEditHover(0)}
                                      className="focus:outline-none"
                                    >
                                      <svg
                                        className={`w-8 h-8 transition-colors ${
                                          star <= (editHover || editRating)
                                            ? "text-yellow-400 fill-current"
                                            : "text-gray-300 fill-current"
                                        }`}
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    </button>
                                  ))}
                                </div>
                                <textarea
                                  value={editComment}
                                  onChange={(e) => setEditComment(e.target.value)}
                                  placeholder="Write your review (optional)"
                                  rows={3}
                                  maxLength={1000}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                />
                                {editError && <p className="text-red-500 text-xs">{editError}</p>}
                                <div className="flex gap-2">
                                  <button
                                    type="submit"
                                    disabled={editSubmitting}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg"
                                  >
                                    {editSubmitting ? "Saving…" : "Save changes"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEditReview}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center space-x-3 min-w-0">
                                    <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm shrink-0">
                                      {review.userName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900 text-sm">{review.userName}</p>
                                      <p className="text-xs text-gray-400">
                                        {new Date(review.createdAt).toLocaleDateString("en-NP", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        })}
                                        {review.updatedAt &&
                                          new Date(review.updatedAt).getTime() >
                                            new Date(review.createdAt).getTime() + 1000 && (
                                            <span className="text-gray-400"> · edited</span>
                                          )}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <div className="flex text-yellow-400">
                                      {[1, 2, 3, 4, 5].map((i) => (
                                        <svg
                                          key={i}
                                          className={`w-4 h-4 ${i <= review.rating ? "fill-current" : "fill-gray-300"}`}
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      ))}
                                    </div>
                                    {token && isReviewMine(review) && (
                                      <button
                                        type="button"
                                        onClick={() => startEditReview(review)}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                      >
                                        Edit
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {review.comment ? (
                                  <p className="text-gray-700 text-sm">{review.comment}</p>
                                ) : (
                                  <p className="text-gray-400 text-sm italic">No written comment</p>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Related Books */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {relatedBooks.map((relatedBook) => (
                  <Link
                    key={relatedBook._id}
                    to={`/book/${relatedBook._id}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden group"
                  >
                    <div className="aspect-[2/3] bg-gray-200 overflow-hidden">
                      <img
                        src={relatedBook.coverImage || 'https://via.placeholder.com/300x400?text=No+Image'}
                        alt={relatedBook.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-800 line-clamp-2 mb-1">
                        {relatedBook.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{relatedBook.author}</p>
                      <p className="text-lg font-bold text-gray-900">Rs. {relatedBook.price?.purchase || 0}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 md:py-12 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex flex-col">
                  <div className="w-5 h-5 bg-green-500 rounded-sm mb-0.5"></div>
                  <div className="w-5 h-4 bg-orange-500 rounded-sm mb-0.5"></div>
                  <div className="w-5 h-3 bg-red-500 rounded-sm"></div>
                </div>
                <span className="text-lg font-bold text-gray-800">Bookify</span>
              </div>
              <p className="text-gray-600 text-sm">
                Bringing stories to your doorstep with ease.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-600 hover:text-blue-600 transition text-sm">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/catalog" className="text-gray-600 hover:text-blue-600 transition text-sm">
                    Catalog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Services</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#renting" className="text-gray-600 hover:text-blue-600 transition text-sm">
                    Renting System
                  </a>
                </li>
                <li>
                  <a href="#bookstore" className="text-gray-600 hover:text-blue-600 transition text-sm">
                    Book Store
                  </a>
                </li>
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

export default BookDetails;

