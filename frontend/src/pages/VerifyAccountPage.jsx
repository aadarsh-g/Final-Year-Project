import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function VerifyAccountPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const userId = location.state?.userId;
  const email = location.state?.email;

  useEffect(() => {
    if (!userId) {
      navigate('/signup');
    }
  }, [userId, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(countdown);
    }
  }, [timer]);

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP input change
  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    
    // Focus last filled input or first empty
    const lastIndex = Math.min(pastedData.length, 5);
    document.getElementById(`otp-${lastIndex}`)?.focus();
  };

  // Handle verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/auth/verify-otp', {
        userId,
        otp: otpCode
      });

      if (response.data.success) {
        setSuccess(true);
        
        // Store token and user data (auto-login after verification)
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error('Verification error:', err);
      const errorData = err.response?.data;
      
      if (errorData?.expired) {
        setError("Verification code expired. Please request a new one.");
        setCanResend(true);
      } else {
        setError(errorData?.message || "Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResend = async () => {
    setError("");
    setResending(true);

    try {
      const response = await axios.post('http://localhost:5001/api/auth/resend-otp', {
        userId
      });

      if (response.data.success) {
        setOtp(["", "", "", "", "", ""]);
        setTimer(600); // Reset timer
        setCanResend(false);
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError(err.response?.data?.message || "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 md:py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
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

            <Link
              to="/login"
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition"
            >
              <span className="font-medium">Back to Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 text-center">
              Verify Your Email
            </h1>
            <p className="text-gray-600 mb-6 text-center">
              We've sent a 6-digit verification code to<br />
              <span className="font-semibold text-gray-900">{email}</span>
            </p>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-green-800">Email verified successfully! Redirecting to login...</p>
                </div>
              </div>
            )}

            <form onSubmit={handleVerify}>
              {/* OTP Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Enter Verification Code
                </label>
                <div className="flex justify-center space-x-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-12 md:w-14 md:h-14 text-center text-xl md:text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none transition"
                      disabled={loading || success}
                    />
                  ))}
                </div>
              </div>

              {/* Timer */}
              <div className="text-center mb-6">
                {timer > 0 ? (
                  <p className="text-sm text-gray-600">
                    Code expires in{" "}
                    <span className="font-semibold text-teal-600">
                      {formatTime(timer)}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-red-600 font-semibold">
                    Verification code expired
                  </p>
                )}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || success || otp.join('').length !== 6}
                className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : success ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Verified!
                  </>
                ) : (
                  "Verify Email"
                )}
              </button>

              {/* Resend Code */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive the code?
                </p>
                {!canResend && (
                  <p className="text-xs text-gray-500 mb-1">
                    You can resend after the timer expires
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || resending || success}
                  className="text-teal-600 hover:text-teal-700 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resending ? "Sending..." : "Resend Code"}
                </button>
              </div>
            </form>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                📬 Check your spam/junk folder if you don't see it in your inbox
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default VerifyAccountPage;
