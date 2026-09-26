import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockApiRequest } from '../api/axiosClient';
import { USER_ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('stocksense_user');
      return savedUser ? JSON.parse(savedUser) : {
        id: 'usr-default',
        name: 'Sarah Jenkins',
        email: 'manager@stocksense.com',
        role: USER_ROLES.MANAGER
      };
    } catch {
      return null;
    }
  });

  const [activeWarehouse, setActiveWarehouse] = useState(() => {
    return localStorage.getItem('stocksense_active_wh') || 'wh-main';
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('stocksense_user', JSON.stringify(user));
      localStorage.setItem('stocksense_role', user.role);
    } else {
      localStorage.removeItem('stocksense_user');
      localStorage.removeItem('stocksense_role');
      localStorage.removeItem('stocksense_token');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('stocksense_active_wh', activeWarehouse);
  }, [activeWarehouse]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await mockApiRequest('POST', '/auth/login', { email, password });
      setUser(res.user);
      localStorage.setItem('stocksense_token', res.token);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, name, role) => {
    setLoading(true);
    try {
      const res = await mockApiRequest('POST', '/auth/register', { email, name, role });
      setUser(res.user);
      localStorage.setItem('stocksense_token', res.token);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (email) => {
    return mockApiRequest('POST', '/auth/forgot-password/send-otp', { email });
  };

  const verifyOtp = async (otp) => {
    return mockApiRequest('POST', '/auth/forgot-password/verify-otp', { otp });
  };

  const resetPassword = async (email, newPassword) => {
    return mockApiRequest('POST', '/auth/forgot-password/reset', { email, newPassword });
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole) => {
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        activeWarehouse,
        setActiveWarehouse,
        login,
        register,
        sendOtp,
        verifyOtp,
        resetPassword,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
