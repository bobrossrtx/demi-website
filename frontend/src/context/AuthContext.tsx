import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextProps {
  isAuthenticated: boolean;
  loading: boolean;
  isAdmin: boolean;
  accessToken: string | null;
  user: any | null;
  login: (token: string, isAdmin: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null); // Add user state
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attempt to refresh the access token using the refresh token cookie
        const response = await fetch('/api/auth/refresh-token', {
          method: 'POST',
          credentials: 'include', // Include cookies for refresh token
        });

        if (response.ok) {
          const data = await response.json();
          setAccessToken(data.token);
          setIsAuthenticated(true);

          if (data.id == undefined) {
            setIsAuthenticated(false);
            setUser(null);
            return;
          }

          // Fetch user profile data
          const profileResponse = await fetch(`/api/auth/profile/id:${data.id}`, {
            credentials: 'include',
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log("User profile fetched successfully.", profileData);
            setUser(profileData);
          } else {
            console.error("Failed to fetch user profile.");
            setUser(null); // Clear user data if profile fetch fails
          }
        } else {
          console.warn("Failed to refresh access token.");
          setIsAuthenticated(false);
          setUser(null); // Clear user data if token refresh fails
        }
      } catch (error) {
        console.error("Error during authentication initialization:", error);
        setIsAuthenticated(false);
        setUser(null); // Clear user data on error
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []); // Run only once on component mount

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const response = await fetch('/api/auth/verify-admin', {
          credentials: 'include', // Include cookies for refresh token
        });

        if (response.ok) {
          setIsAuthenticated(true);
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      verifyAdmin();
    }
  }, [accessToken]);

  const login = (token: string, isAdmin: boolean) => {
    setAccessToken(token);
    setIsAuthenticated(true);
    setIsAdmin(isAdmin);
    setLoading(false);
  };

  const logout = () => {
    setAccessToken(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null); // Clear user state on logout

    // delete the refresh token cookie
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Failed to log out from the server');
        }
      })
      .catch((error) => {
        console.error('Error during logout:', error);
      })
      .finally(() => {
        navigate('/');
      });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, isAdmin, accessToken, user, login, logout }}>
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