import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pharmavision_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const safetyTimer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 4500);

    async function initAuth() {
      if (!token) {
        if (isMounted) setLoading(false);
        clearTimeout(safetyTimer);
        return;
      }
      try {
        const res = await api.getProfile();
        if (isMounted) setUser(res.user);
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        localStorage.removeItem('pharmavision_token');
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        clearTimeout(safetyTimer);
        if (isMounted) setLoading(false);
      }
    }
    initAuth();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('pharmavision_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.register(name, email, password);
    localStorage.setItem('pharmavision_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const loginWithGoogle = async (googleData) => {
    const res = await api.loginWithGoogle(googleData);
    localStorage.setItem('pharmavision_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('pharmavision_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
