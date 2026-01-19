import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for stored user session
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('currentUser');
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const isEditor = () => {
    return user && (user.role === 'editor' || user.role === 'admin');
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isEditor,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
