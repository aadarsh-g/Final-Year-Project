import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw || raw === 'undefined') return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  // Hydrate immediately from localStorage so UI (e.g. Settings) matches the sidebar before /auth/me returns
  const [user, setUser] = useState(() => readStoredUser());
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const storedUser = readStoredUser();

    if (token && storedUser) {
      try {
        const response = await api.get('/auth/me');
        const me = response.data.user;
        if (me) {
          setUser(me);
          localStorage.setItem('user', JSON.stringify(me));
        }
        setIsAuthenticated(true);
      } catch (error) {
        // Only clear session on auth failure (401), not network / server errors
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } else if (!token) {
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        rememberMe,
      });

      const { token, user } = response.data;

      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  };

  const signup = async (fullName, email, password, confirmPassword, agreedToTerms) => {
    try {
      const response = await api.post('/auth/signup', {
        fullName,
        email,
        password,
        confirmPassword,
        agreedToTerms,
      });

      const { token, user } = response.data;

      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    if (!updatedUser) return;
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

