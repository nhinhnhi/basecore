import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const API_BASE = 'http://localhost:5001/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Nếu muốn tự động lấy thông tin user từ token (không bắt buộc)
      // decode token để lấy user nếu có
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.nameid,
          userName: payload.unique_name,
          email: payload.email,
          role: payload.role
        });
      } catch (e) {}
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await axios.post(`${API_BASE}/Auth/login`, { userName: username, password });
      const { token: newToken, ...userData } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const isAdmin = user?.role === 'admin'; // Quan trọng cho ProtectedRoute

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};