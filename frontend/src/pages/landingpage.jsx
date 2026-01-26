import { useState } from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="flex flex-col transform group-hover:scale-110 transition-transform duration-300">
                <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-md mb-0.5 shadow-md"></div>
                <div className="w-7 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-md mb-0.5 shadow-md"></div>
                <div className="w-7 h-5 bg-gradient-to-br from-rose-400 to-rose-600 rounded-md shadow-md"></div>
              </div>
              <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Bookify
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 transition font-medium">
                Home
              </a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition font-medium">
                About us
              </a>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="hidden sm:block px-4 py-2 text-gray-700 hover:text-blue-600 transition font-medium"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm md:text-base font-semibold"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-6 md:space-y-8">
              <div className="inline-block">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  📚 Your Reading Journey Starts Here
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                Discover Your Next
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Favorite Book</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
                Access thousands of books through our seamless buying and rental platform. 
                Your perfect story awaits at <span className="font-semibold text-blue-600">Bookify</span>.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/login"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 text-center font-bold text-lg"
                >
                  Browse Books →
                </Link>
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-800 rounded-full hover:border-blue-600 hover:shadow-lg transition-all duration-300 text-center font-bold text-lg"
                >
                  Start Free
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold text-blue-600">10K+</div>
                  <div className="text-sm text-gray-600 mt-1">Books Available</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">5K+</div>
                  <div className="text-sm text-gray-600 mt-1">Happy Readers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-600">4.8★</div>
                  <div className="text-sm text-gray-600 mt-1">User Rating</div>
                </div>
              </div>
            </div>

            {/* Right Side - Hero Image */}
            <div className="relative">
              {/* Decorative Blobs */}
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-40 animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-gradient-to-br from-emerald-200 to-blue-200 rounded-full blur-3xl opacity-40 animate-pulse delay-1000"></div>
              
              {/* Main Image Card */}
              <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded-3xl shadow-2xl">
                  <div className="bg-white p-4 rounded-3xl">
                    <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg">
                      <img
                        src="/images/boy-reading-book-stockcake.jpg.webp"
                        alt="Reading experience"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full hidden items-center justify-center">
                        <div className="text-center">
                          <svg className="w-24 h-24 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <p className="text-gray-500 mt-2">Book Image</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Card */}
              <div className="hidden lg:block absolute -left-8 top-1/2 transform -translate-y-1/2 bg-white p-4 rounded-2xl shadow-2xl animate-bounce-slow">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-xl">
                    ✓
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">Easy Access</div>
                    <div className="text-xs text-gray-500">Rent or Buy Instantly</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Bookify</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need for the perfect reading experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform">
                📖
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Vast Collection</h3>
              <p className="text-gray-600">
                Access over 10,000+ books across all genres. From bestsellers to hidden gems.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform">
                💰
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Affordable Rentals</h3>
              <p className="text-gray-600">
                Rent books at amazing prices. Save money while enjoying unlimited reading.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Access</h3>
              <p className="text-gray-600">
                Get your books instantly. No waiting, no hassle. Start reading right away.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Featured Books
              </h2>
              <p className="text-gray-600">Handpicked favorites from our collection</p>
            </div>
            <Link
              to="/login"
              className="mt-4 sm:mt-0 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 hover:shadow-lg transition-all duration-300 font-semibold"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Book Card 1 */}
            <Link to="/login" className="group">
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="aspect-[2/3] bg-gradient-to-br from-pink-200 to-pink-300">
                  <img
                    src="/images/It ends with us.jpg"
                    alt="It Ends With Us"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full inline-block mb-2">Romance</div>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">It Ends With Us</h3>
                <p className="text-sm text-gray-600">Colleen Hoover</p>
              </div>
            </Link>

            {/* Book Card 2 */}
            <Link to="/login" className="group">
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="aspect-[2/3] bg-gradient-to-br from-blue-900 to-blue-950">
                  <img
                    src="/images/The Great Gatsby.jpg"
                    alt="The Great Gatsby"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full inline-block mb-2">Classic</div>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">The Great Gatsby</h3>
                <p className="text-sm text-gray-600">F. Scott Fitzgerald</p>
              </div>
            </Link>

            {/* Book Card 3 */}
            <Link to="/login" className="group">
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="aspect-[2/3] bg-gradient-to-br from-blue-100 to-blue-200">
                  <img
                    src="/images/The Fault In Our Stars.jpg"
                    alt="The Fault In Our Stars"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full inline-block mb-2">Young Adult</div>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">The Fault In Our Stars</h3>
                <p className="text-sm text-gray-600">John Green</p>
              </div>
            </Link>

            {/* Book Card 4 */}
            <Link to="/login" className="group">
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="aspect-[2/3] bg-gradient-to-br from-purple-900 to-indigo-900">
                  <img
                    src="/images/Harry Potter.jpg"
                    alt="Harry Potter"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full inline-block mb-2">Fantasy</div>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">Harry Potter</h3>
                <p className="text-sm text-gray-600">J.K. Rowling</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Image */}
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 rounded-3xl transform rotate-3"></div>
                <div className="relative bg-white p-2 rounded-3xl shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="aspect-square rounded-2xl overflow-hidden">
                    <img
                      src="/images/book-pile-of-must-read-books-scaled1.jpg"
                      alt="Book collection"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full hidden items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                      <div className="text-center">
                        <svg className="w-32 h-32 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Text */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                About Bookify
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Your Trusted Reading Partner Since Day One
              </h2>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                At <span className="font-semibold text-blue-600">Bookify</span>, we're passionate about making reading accessible to everyone. 
                Whether you want to buy or rent, we've got you covered with an extensive collection 
                that caters to all tastes and preferences.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Curated Selection</h4>
                    <p className="text-gray-600">Handpicked books across all genres</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Flexible Options</h4>
                    <p className="text-gray-600">Buy or rent based on your needs</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">24/7 Support</h4>
                    <p className="text-gray-600">We're here whenever you need us</p>
                  </div>
                </div>
              </div>

              <Link
                to="/login"
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold"
              >
                Start Exploring
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Reading Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of readers who have discovered their favorite books with Bookify
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-4 bg-white text-blue-600 rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg"
              >
                Sign Up Free →
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full hover:bg-white hover:text-blue-600 transition-all duration-300 font-bold text-lg"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex flex-col">
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-md mb-0.5"></div>
                  <div className="w-6 h-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-md mb-0.5"></div>
                  <div className="w-6 h-4 bg-gradient-to-br from-rose-400 to-rose-600 rounded-md"></div>
                </div>
                <span className="text-xl font-bold text-white">Bookify</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Your trusted partner for all reading needs. Discover, rent, and own your favorite books.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition">
                  <span className="text-xl">📘</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition">
                  <span className="text-xl">📱</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition">
                  <span className="text-xl">📧</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#home" className="hover:text-white transition">Home</a></li>
                <li><Link to="/login" className="hover:text-white transition">Catalog</Link></li>
                <li><a href="#about" className="hover:text-white transition">About Us</a></li>
                <li><Link to="/login" className="hover:text-white transition">Login</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-white font-bold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-white transition">Buy Books</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Rent Books</Link></li>
                <li><a href="#" className="hover:text-white transition">Gift Cards</a></li>
                <li><a href="#" className="hover:text-white transition">Membership</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold mb-4">Get in Touch</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center space-x-2">
                  <span>📧</span>
                  <span>info@bookify.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>📞</span>
                  <span>(123) 321-4565</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>📍</span>
                  <span>Kathmandu, Nepal</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 <span className="text-white font-semibold">Bookify</span>. All rights reserved. Made with 💙 for book lovers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
