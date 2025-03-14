import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextProps {
  isAuthenticated: boolean;
  loading: boolean;
  isAdmin: boolean;
  login: (token: string, isAdmin: boolean, userID: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const adminStatus = await fetch('/api/auth/verify-admin', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(res => res.ok)
          .catch(() => false);
        setIsAuthenticated(true);
        setIsAdmin(adminStatus);
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
      setLoading(false);
    };
    verifyAdmin();
  }, []);

  const login = (token: string, isAdmin: boolean, userID: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('is_admin', isAdmin.toString());
    console.log(userID)
    localStorage.setItem('user_id', userID);
    setIsAuthenticated(true);
    setIsAdmin(isAdmin);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('user_id');
    setIsAuthenticated(false);
    setIsAdmin(false);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};