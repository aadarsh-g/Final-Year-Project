import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function GoogleCallback() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get the authorization code from URL
        const params = new URLSearchParams(location.search);
        const code = params.get("code");

        if (!code) {
          setError("No authorization code received");
          setLoading(false);
          return;
        }

        // Exchange code for tokens with Google
        const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
        const REDIRECT_URI = `${window.location.origin}/auth/google/callback`;

        // Exchange authorization code for access token
        const tokenResponse = await axios.post(
          "https://oauth2.googleapis.com/token",
          {
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: "authorization_code",
          }
        );

        const { access_token } = tokenResponse.data;

        // Get user info from Google
        const userInfoResponse = await axios.get(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        const { id: googleId, email, name: fullName, picture: avatar } = userInfoResponse.data;

        // Send user data to our backend
        const response = await axios.post(
          "http://localhost:5001/api/auth/google",
          {
            googleId,
            email,
            fullName,
            avatar,
          }
        );

        // Store token and user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Redirect based on user role
        if (response.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/catalog");
        }
      } catch (err) {
        console.error("Google authentication error:", err);
        const errorMessage =
          err.response?.data?.message ||
          "Google authentication failed. Please try again.";
        setError(errorMessage);
        setLoading(false);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    };

    handleGoogleCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {loading ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <svg
                  className="animate-spin h-12 w-12 text-teal-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Authenticating with Google
              </h2>
              <p className="text-gray-600">Please wait while we sign you in...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <svg
                  className="h-12 w-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Authentication Failed
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-gray-600 text-sm">
                Redirecting to login page...
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default GoogleCallback;

