import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Utility to decode JWT token in browser without extra dependencies
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode JWT token', e);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and load session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('walletwiz_token');
    if (storedToken) {
      const decoded = decodeToken(storedToken);
      if (decoded) {
        setToken(storedToken);
        setUser(decoded);
      } else {
        localStorage.removeItem('walletwiz_token');
      }
    }
    setLoading(false);

    // Listen for global auth expiration event from api interceptor
    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  // Email & Password Registration
  const register = async (firstName, email, password) => {
    try {
      const response = await api.post('/auth/register', {
        first_name: firstName,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // Email & Password Login
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;
      
      localStorage.setItem('walletwiz_token', access_token);
      const decoded = decodeToken(access_token);
      
      setToken(access_token);
      setUser(decoded || { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // Google OAuth Login
  const loginWithGoogle = async (idToken) => {
    try {
      const response = await api.post('/auth/google', { id_token: idToken });
      const { access_token } = response.data;
      
      localStorage.setItem('walletwiz_token', access_token);
      const decoded = decodeToken(access_token);
      
      setToken(access_token);
      setUser(decoded || { email: decoded?.email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // Logout session
  const logout = () => {
    localStorage.removeItem('walletwiz_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
