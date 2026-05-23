import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

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

  // ─── Helper: strip volatile data before saving to localStorage ─────
  const toStorableUser = (userData) => {
    if (!userData) return null;
    const { followers_count, following_count, followers, following, ...rest } = userData;
    return rest;
  };

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
      localStorage.setItem('campuscrate_user', JSON.stringify(toStorableUser(newUser)));
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
      localStorage.setItem('campuscrate_user', JSON.stringify(toStorableUser(newUser)));
    }

    return res.data;
  };

  // ─── Refresh Profile ───────────────────────────────────────────────
  const refreshProfile = async () => {
    try {
      const res = await API.get('/user/profile');
      if (res.data.success) {
        const updatedUser = res.data.user;
        setUser(updatedUser);
        localStorage.setItem('campuscrate_user', JSON.stringify(toStorableUser(updatedUser)));
        return updatedUser;
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
    return null;
  };

  // ─── Update User State ─────────────────────────────────────────────
  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    setUser(merged);
    localStorage.setItem('campuscrate_user', JSON.stringify(toStorableUser(merged)));
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
    refreshProfile,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
