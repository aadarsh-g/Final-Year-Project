import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [selectedOption, setSelectedOption] = useState("buy"); // 'buy' or 'rent'
  const [rentalDuration, setRentalDuration] = useState(7); // days
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description"); // description, reviews, details

  // Sample book data (in real app, fetch from API based on id)
  const booksData = {
    1: {
      id: 1,
      title: "It Ends With Us",
      author: "Colleen Hoover",
      price: 14.99,
      rentPrice: 3.99,
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
      price: 12.99,
      rentPrice: 2.99,
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

  const book = booksData[id] || booksData[1]; // Default to first book if not found

  const relatedBooks = [
    { id: 2, title: "The Great Gatsby", author: "F. Scott Fitzgerald", image: "/images/The Great Gatsby.jpg", price: 12.99 },
    { id: 3, title: "The Fault In Our Stars", author: "John Green", image: "/images/The Fault In Our Stars.jpg", price: 13.99 },
    { id: 4, title: "Harry Potter", author: "J.K. Rowling", image: "/images/Harry Potter.jpg", price: 16.99 },
  ];

  const sampleReviews = [
    {
      id: 1,
      userName: "Sarah Johnson",
      rating: 5,
      date: "December 15, 2024",
      comment: "Absolutely loved this book! The story was captivating from start to finish. Highly recommend!",
    },
    {
      id: 2,
      userName: "Michael Brown",
      rating: 4,
      date: "December 10, 2024",
      comment: "Great read! The characters were well-developed and the plot kept me engaged throughout.",
    },
    {
      id: 3,
      userName: "Emily Davis",
      rating: 5,
      date: "December 5, 2024",
      comment: "One of the best books I've read this year. Couldn't put it down!",
    },
  ];

  const calculateRentalPrice = () => {
    const weeks = Math.ceil(rentalDuration / 7);
    return (book.rentPrice * weeks).toFixed(2);
  };

  const handleAddToCart = () => {
    const item = {
      bookId: book.id,
      title: book.title,
      type: selectedOption,
      price: selectedOption === "buy" ? book.price : parseFloat(calculateRentalPrice()),
      quantity: selectedOption === "buy" ? quantity : 1,
      rentalDuration: selectedOption === "rent" ? rentalDuration : null,
    };
    console.log("Adding to cart:", item);
    alert(`Added "${book.title}" to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
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

            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition">
                Home
              </Link>
              <Link to="/catalog" className="text-gray-700 hover:text-blue-600 transition">
                Catalog
              </Link>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition">
                About us
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <Link to="/login" className="hidden sm:block text-gray-700 hover:text-blue-600 transition">
                Log in
              </Link>
              <Link to="/signup" className="px-4 py-2 border-2 border-amber-600 text-gray-800 hover:bg-amber-50 rounded-md transition text-sm md:text-base">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-700">
              Home
            </Link>
            <span className="text-gray-400">/</span>
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
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
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
                      <p className="text-3xl font-bold text-gray-900">${book.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Rent From</p>
                      <p className="text-2xl font-bold text-blue-600">${book.rentPrice}/week</p>
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
                            i < Math.floor(book.rating) ? "fill-current" : "fill-gray-300"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-700 font-medium">{book.rating}</span>
                  </div>
                  <span className="text-gray-500">|</span>
                  <Link to="#reviews" className="text-blue-600 hover:text-blue-700">
                    {book.totalReviews} reviews
                  </Link>
                </div>
              </div>

              {/* Category and Availability */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {book.category}
                </span>
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {book.availability}
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
                        <p className="text-4xl font-bold text-gray-900">${book.price}</p>
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
                      <span>Free shipping on orders over $25</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-lg font-semibold text-gray-700">Total:</span>
                      <span className="text-3xl font-bold text-gray-900">
                        ${(book.price * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Rent Option Details */}
                {selectedOption === "rent" && (
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Rental Price</p>
                      <p className="text-4xl font-bold text-blue-600">${book.rentPrice}/week</p>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rental Duration
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[7, 14, 21, 30].map((days) => (
                          <button
                            key={days}
                            onClick={() => setRentalDuration(days)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                              rentalDuration === days
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 border border-gray-300 hover:border-blue-600"
                            }`}
                          >
                            {days} days
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Flexible rental period</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Easy return process</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-blue-200">
                      <div>
                        <span className="text-sm text-gray-600 block">Total for {rentalDuration} days:</span>
                        <span className="text-lg font-semibold text-gray-700">
                          {Math.ceil(rentalDuration / 7)} week{Math.ceil(rentalDuration / 7) > 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="text-3xl font-bold text-blue-600">
                        ${calculateRentalPrice()}
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

                <button className="w-full mt-3 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition duration-200">
                  Add to Wishlist
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
                    Reviews ({book.totalReviews})
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div>
                {activeTab === "description" && (
                  <div>
                    <p className="text-gray-700 leading-relaxed mb-6">{book.description}</p>
                    <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {book.features.map((feature, index) => (
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
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
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
                      <span className="text-gray-900 font-medium">{book.publishDate}</span>
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
                    <div className="mb-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews</h4>
                      <div className="flex items-center mb-6">
                        <div className="text-5xl font-bold text-gray-900 mr-6">{book.rating}</div>
                        <div>
                          <div className="flex text-yellow-400 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-6 h-6 ${
                                  i < Math.floor(book.rating) ? "fill-current" : "fill-gray-300"
                                }`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-gray-600">Based on {book.totalReviews} reviews</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {sampleReviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                                {review.userName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{review.userName}</p>
                                <p className="text-sm text-gray-500">{review.date}</p>
                              </div>
                            </div>
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? "fill-current" : "fill-gray-300"
                                  }`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>

                    <button className="mt-6 px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition">
                      Write a Review
                    </button>
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
                    key={relatedBook.id}
                    to={`/book/${relatedBook.id}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden group"
                  >
                    <div className="aspect-[2/3] bg-gray-200 overflow-hidden">
                      <img
                        src={relatedBook.image}
                        alt={relatedBook.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-800 line-clamp-2 mb-1">
                        {relatedBook.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{relatedBook.author}</p>
                      <p className="text-lg font-bold text-gray-900">${relatedBook.price}</p>
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

