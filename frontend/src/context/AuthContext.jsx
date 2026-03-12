import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, getUser, logout as authLogout, isAuthenticated as checkAuth } from '../utils/auth';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth on mount
    const check = () => {
      const isAuth = checkAuth();
      setIsAuthenticated(isAuth);
      if (isAuth) {
        setUser(getUser());
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    
    check();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authLogout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
