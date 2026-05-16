import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Load from localStorage on mount ───────────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem('campuscrate_token');
    const savedUser = localStorage.getItem('campuscrate_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // ─── Signup ─────────────────────────────────────────────────────────
  const signup = async (userData) => {
    const res = await API.post('/user/signup', userData);
    return res.data;
  };

  // ─── Verify OTP ─────────────────────────────────────────────────────
  const verifyOTP = async (email, otp) => {
    const res = await API.post('/user/verify', { email, otp });

    if (res.data.success && res.data.token) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('campuscrate_token', newToken);
      localStorage.setItem('campuscrate_user', JSON.stringify(newUser));
    }

    return res.data;
  };

  // ─── Resend OTP ─────────────────────────────────────────────────────
  const resendOTP = async (email) => {
    const res = await API.post('/user/resend-otp', { email });
    return res.data;
  };

  // ─── Login ──────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await API.post('/user/login', { email, password });

    if (res.data.success && res.data.token) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('campuscrate_token', newToken);
      localStorage.setItem('campuscrate_user', JSON.stringify(newUser));
    }

    return res.data;
  };

  // ─── Logout ─────────────────────────────────────────────────────────
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('campuscrate_token');
    localStorage.removeItem('campuscrate_user');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    signup,
    verifyOTP,
    resendOTP,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
