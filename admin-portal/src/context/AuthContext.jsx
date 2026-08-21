import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/auth`;

const getRoleRoute = (role) => {
  const routes = { admin: '/admin/dashboard', subadmin: '/subadmin', recruiter: '/company/dashboard', company: '/company/dashboard', jobseeker: '/candidate', org_employee: '/employee', college: '/college/dashboard', drive_incharge: '/incharge' };
  return routes[role] || '/candidate';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const setTokenAndHeader = (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setTokenState(newToken);
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setTokenState(null);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        // Hydrate immediately from localStorage so the UI doesn't flash
        setUser(JSON.parse(storedUser));
        setTokenState(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        // Then sync from server — this triggers ensureFreePlan for users with no subscription
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/me`)
          .then(res => {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          })
          .catch((err) => {
            // Only clear session if token is explicitly invalid/expired (401 or 403)
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
              localStorage.removeItem('user');
              setTokenAndHeader(null);
              setUser(null);
            }
          })
          .finally(() => setLoading(false));
        return;
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
        setTokenAndHeader(null);
      }
    }
    setLoading(false);
  }, []);

  const processPendingAssessment = async (role) => {
    if (role !== 'jobseeker') return;
    const pending = localStorage.getItem('pendingAssessment');
    if (pending) {
      try {
        const assessment = JSON.parse(pending);
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/skill-tests/save`, assessment);
        localStorage.removeItem('pendingAssessment');
      } catch (err) {
        console.error('Error saving pending assessment:', err);
      }
    }
  };

  const login = useCallback(async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      
      if (res.data.requireOtp) {
        return { success: true, requireOtp: true, email: res.data.email, msg: res.data.msg };
      }

      const { user, token: resToken } = res.data;
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setTokenAndHeader(resToken);
      await processPendingAssessment(user.role);
      return { success: true, redirect: getRoleRoute(user.role) };
    } catch (err) {
      return { success: false, msg: err.response?.data?.msg || 'Login failed' };
    }
  }, []);

  const adminLogin = useCallback(async (email, password) => {
    try {
      const ADMIN_API_URL = `${import.meta.env.VITE_API_BASE_URL}/admin`;
      const res = await axios.post(`${ADMIN_API_URL}/login`, { email, password });
      
      if (res.data.require2FA) {
        return { success: true, require2FA: true, adminId: res.data.adminId };
      }
      
      const { user, token: resToken } = res.data;
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setTokenAndHeader(resToken);
      return { success: true, redirect: getRoleRoute(user.role) };
    } catch (err) {
      return { success: false, msg: err.response?.data?.msg || 'Admin login failed' };
    }
  }, []);

  const verifyAdminOtp = useCallback(async (adminId, otp) => {
    try {
      const ADMIN_API_URL = `${import.meta.env.VITE_API_BASE_URL}/admin`;
      const res = await axios.post(`${ADMIN_API_URL}/login-verify-otp`, { adminId, otp });
      const { user, token: resToken } = res.data;
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setTokenAndHeader(resToken);
      return { success: true, redirect: getRoleRoute(user.role) };
    } catch (err) {
      return { success: false, msg: err.response?.data?.msg || 'Invalid or expired OTP' };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/register`, userData);
      
      if (res.data.requireOtp) {
        return { success: true, requireOtp: true, email: res.data.email, msg: res.data.msg };
      }

      // Fallback if no OTP required
      const { user, token: resToken } = res.data;
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setTokenAndHeader(resToken);
      await processPendingAssessment(user.role);
      return { success: true, redirect: getRoleRoute(user.role) };
    } catch (err) {
      return { success: false, msg: err.response?.data?.msg || 'Registration failed' };
    }
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    try {
      const res = await axios.post(`${API_URL}/verify-otp`, { email, otp });
      const { user, token: resToken } = res.data;
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setTokenAndHeader(resToken);
      await processPendingAssessment(user.role);
      return { success: true, redirect: getRoleRoute(user.role) };
    } catch (err) {
      return { success: false, msg: err.response?.data?.msg || 'Invalid or expired OTP' };
    }
  }, []);

  const forgotPassword = async (email) => {
    try {
      const res = await axios.post(`${API_URL}/forgot-password`, { email });
      return { success: true, msg: res.data.msg };
    } catch (err) {
      return { success: false, msg: err.response?.data?.msg || 'Failed to send reset email' };
    }
  };
  
  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await axios.post(`${API_URL}/reset-password`, { email, otp, newPassword });
      return { success: true, msg: res.data.msg };
    } catch (err) {
      return { success: false, msg: err.response?.data?.msg || 'Failed to reset password. OTP may be invalid.' };
    }
  };

  const resendOtp = async (email) => {
    try {
      const res = await axios.post(`${API_URL}/resend-otp`, { email });
      return { success: true, msg: res.data.msg };
    } catch (err) {
      return { success: false, msg: err.response?.data?.msg || 'Failed to resend OTP' };
    }
  };

  const completeSocialLogin = useCallback(async (token, userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setTokenAndHeader(token);
    await processPendingAssessment(userData.role);
    return { success: true, redirect: getRoleRoute(userData.role) };
  }, []);

  const updateUser = useCallback((newData) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...newData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const logout = useCallback(() => {
    axios.post(`${API_URL}/logout`).catch(() => {});
    setUser(null);
    localStorage.removeItem('user');
    setTokenAndHeader(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/me`);
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, loading, token, login, adminLogin, verifyAdminOtp, register, verifyOtp, 
      forgotPassword, resetPassword, logout, completeSocialLogin, refreshUser, updateUser, resendOtp
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
