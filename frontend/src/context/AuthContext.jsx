import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set default API base URL (falls back to local port 5000 in dev)
  axios.defaults.baseURL = 'http://localhost:5000';

  // Axios request interceptor to append JWT token
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.request.eject(interceptor);
  }, []);

  // Hydrate user state from token on startup
  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get('/api/auth/me');
        setUser(data);
      } catch (err) {
        console.error('Error auto-authenticating user:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  // Register Handler
  const register = async (name, email, password, role, phone, profilePhoto) => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/auth/register', { name, email, password, role, phone, profilePhoto });
      localStorage.setItem('token', data.token);
      
      // Immediately fetch complete User payload
      const profile = await axios.get('/api/auth/me');
      setUser(profile.data);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || { en: 'Registration failed', hi: 'पंजीकरण विफल रहा' }
      };
    } finally {
      setLoading(false);
    }
  };

  // Login Handler
  const login = async (email, password, role) => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/auth/login', { email, password, role });
      localStorage.setItem('token', data.token);
      
      // Fetch full User profile
      const profile = await axios.get('/api/auth/me');
      setUser(profile.data);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || { en: 'Invalid credentials', hi: 'अमान्य क्रेडेंशियल' }
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout Handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
