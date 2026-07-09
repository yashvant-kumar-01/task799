import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axiosInstance.get('/auth/me');
          setUser(res.data.data);
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const register = async (name, email, password, role) => {
    setError(null);
    try {
      await axiosInstance.post('/auth/register', { name, email, password, role });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};
