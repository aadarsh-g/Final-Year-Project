import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user types
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Direct API call
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect based on user role
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/catalog');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Google Login Handler
  const handleGoogleLogin = () => {
    setError("");
    // Redirect to Google OAuth
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
    const REDIRECT_URI = `${window.location.origin}/auth/google/callback`;
    const SCOPE = "openid profile email";
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPE)}&access_type=offline&prompt=consent`;
    
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 md:py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex flex-col">
                <div className="w-5 h-5 bg-green-500 rounded-sm mb-0.5"></div>
                <div className="w-5 h-4 bg-orange-500 rounded-sm mb-0.5"></div>
                <div className="w-5 h-3 bg-red-500 rounded-sm"></div>
              </div>
              <span className="text-xl md:text-2xl font-bold text-gray-800">
                Bookify
              </span>
            </Link>

            {/* Back to Home Link */}
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
          {/* Left Side - Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:pl-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Welcome Back!
            </h1>
            <p className="text-gray-600 mb-8">
              Please enter your details to login.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-base font-semibold text-gray-900 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@gmail.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-base font-semibold text-gray-900 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  required
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <label
                    htmlFor="rememberMe"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-300 w-full"></div>
                <span className="bg-gray-50 px-4 text-sm text-gray-500 absolute">
                  Or continue with
                </span>
              </div>

              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-6 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border-2 border-gray-300 hover:border-gray-400 transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Signup Link */}
              <p className="text-center text-gray-700">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-gray-900 font-medium hover:underline"
                >
                  Sign up now
                </Link>
              </p>
            </form>
          </div>

          {/* Right Side - Illustration */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-full max-w-lg">
              {/* Background circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full opacity-60"></div>
              
              {/* Enhanced Illustration */}
              <div className="relative z-10 flex items-center justify-center p-8">
                <svg
                  viewBox="0 0 700 600"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto drop-shadow-lg"
                >
                  {/* Back Browser Window */}
                  <g opacity="0.7">
                    <rect x="140" y="100" width="320" height="240" rx="12" fill="white" stroke="#1F2937" strokeWidth="3" />
                    <rect x="140" y="100" width="320" height="35" rx="12" fill="#E5E7EB" stroke="#1F2937" strokeWidth="3" />
                    <circle cx="160" cy="117" r="5" fill="#EF4444" />
                    <circle cx="180" cy="117" r="5" fill="#F59E0B" />
                    <circle cx="200" cy="117" r="5" fill="#10B981" />
                  </g>
                  
                  {/* Front Browser Window */}
                  <rect x="180" y="150" width="360" height="300" rx="12" fill="white" stroke="#1F2937" strokeWidth="4" />
                  <rect x="180" y="150" width="360" height="40" rx="12" fill="#F3F4F6" stroke="#1F2937" strokeWidth="4" />
                  <circle cx="200" cy="170" r="5" fill="#EF4444" />
                  <circle cx="220" cy="170" r="5" fill="#F59E0B" />
                  <circle cx="240" cy="170" r="5" fill="#10B981" />
                  
                  {/* Lock Icon */}
                  <g transform="translate(470, 120)">
                    <rect x="0" y="15" width="50" height="45" rx="6" fill="#4FD1C5" stroke="#1F2937" strokeWidth="3" />
                    <path d="M12 15 L12 10 Q12 0 25 0 Q38 0 38 10 L38 15" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <circle cx="25" cy="35" r="6" fill="#1F2937" />
                    <rect x="22" y="35" width="6" height="12" fill="#1F2937" />
                  </g>
                  
                  {/* Form Fields */}
                  <rect x="220" y="220" width="280" height="40" rx="6" fill="#4FD1C5" stroke="#1F2937" strokeWidth="2" />
                  <text x="230" y="245" fill="#1F2937" fontSize="18" fontWeight="500">Email Address</text>
                  
                  <rect x="220" y="275" width="280" height="40" rx="6" fill="white" stroke="#1F2937" strokeWidth="2" />
                  <circle cx="240" cy="295" r="4" fill="#1F2937" />
                  <circle cx="255" cy="295" r="4" fill="#1F2937" />
                  <circle cx="270" cy="295" r="4" fill="#1F2937" />
                  <circle cx="285" cy="295" r="4" fill="#1F2937" />
                  <circle cx="300" cy="295" r="4" fill="#1F2937" />
                  <circle cx="315" cy="295" r="4" fill="#1F2937" />
                  <circle cx="330" cy="295" r="4" fill="#1F2937" />
                  <circle cx="345" cy="295" r="4" fill="#1F2937" />
                  
                  <rect x="220" y="330" width="280" height="45" rx="8" fill="#4FD1C5" stroke="#1F2937" strokeWidth="2" />
                  <text x="320" y="358" fill="#1F2937" fontSize="20" fontWeight="600" textAnchor="middle">Log In</text>
                  
                  {/* Shield Icon */}
                  <g transform="translate(380, 395)">
                    <path d="M0 -20 L15 -15 L15 5 Q15 20 0 25 Q-15 20 -15 5 L-15 -15 Z" fill="#10B981" stroke="#1F2937" strokeWidth="2" />
                    <path d="M-5 5 L0 10 L10 -5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>
                  
                  {/* Person Character */}
                  <g transform="translate(550, 320)">
                    {/* Body */}
                    <ellipse cx="0" cy="100" rx="50" ry="60" fill="#4FD1C5" stroke="#1F2937" strokeWidth="3" />
                    <rect x="-50" y="80" width="100" height="80" fill="#4FD1C5" />
                    
                    {/* Neck */}
                    <rect x="-12" y="35" width="24" height="25" fill="#FCD5B5" />
                    
                    {/* Head */}
                    <ellipse cx="0" cy="20" rx="35" ry="40" fill="#FCD5B5" stroke="#1F2937" strokeWidth="3" />
                    
                    {/* Hair */}
                    <path d="M-35 15 Q-35 -20 0 -20 Q35 -20 35 15" fill="#1F2937" />
                    <ellipse cx="0" cy="-15" rx="30" ry="15" fill="#1F2937" />
                    
                    {/* Eyes */}
                    <circle cx="-12" cy="15" r="3" fill="#1F2937" />
                    <circle cx="12" cy="15" r="3" fill="#1F2937" />
                    
                    {/* Smile */}
                    <path d="M-12 28 Q0 35 12 28" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
                    
                    {/* Left Arm pointing */}
                    <path d="M-45 90 L-90 70 Q-100 68 -100 75 L-85 85" fill="#4FD1C5" stroke="#1F2937" strokeWidth="3" />
                    
                    {/* Hand */}
                    <ellipse cx="-92" cy="77" rx="12" ry="10" fill="#FCD5B5" stroke="#1F2937" strokeWidth="2" />
                    
                    {/* Right Arm */}
                    <path d="M45 90 L80 110" stroke="#4FD1C5" strokeWidth="20" strokeLinecap="round" />
                    
                    {/* Right Hand */}
                    <ellipse cx="85" cy="112" rx="10" ry="12" fill="#FCD5B5" stroke="#1F2937" strokeWidth="2" />
                  </g>
                  
                  {/* Cursor */}
                  <g transform="translate(320, 350)">
                    <path d="M0 0 L0 24 L7 18 L11 27 L16 25 L12 16 L22 16 Z" fill="white" stroke="#1F2937" strokeWidth="2" />
                  </g>
                  
                  {/* Decorative Elements */}
                  <circle cx="120" cy="180" r="8" fill="#4FD1C5" opacity="0.5" />
                  <circle cx="600" cy="250" r="12" fill="#4FD1C5" opacity="0.3" />
                  <circle cx="140" cy="400" r="6" fill="#10B981" opacity="0.4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;

