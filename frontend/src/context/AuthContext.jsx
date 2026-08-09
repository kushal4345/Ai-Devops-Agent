import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize: Check URL for token OR attempt to refresh on load
  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Check if we just redirected back from GitHub with a token in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('access_token');

      if (tokenFromUrl) {
        setAccessToken(tokenFromUrl);
        setIsAuthenticated(true);
        
        // Remove token from URL for security
        window.history.replaceState({}, document.title, window.location.pathname);
        setIsLoading(false);
        return;
      }

      // 2. If no token in URL, try to refresh using the HttpOnly cookie silently
      try {
        const res = await apiClient.post('/auth/refresh');
        if (res.data.accessToken) {
          setAccessToken(res.data.accessToken);
          setIsAuthenticated(true);
        }
      } catch (err) {
        // Expected if not logged in
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for unauthorized events from the Axios interceptor
    const handleUnauthorized = () => {
      setAccessToken(null);
      setIsAuthenticated(false);
    };
    
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Update Axios headers whenever the access token changes
  useEffect(() => {
    if (accessToken) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);

  const login = () => {
    // Redirect to the backend OAuth initialization endpoint
    window.location.href = 'http://localhost:3000/api/auth/github';
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout failed on server', err);
    } finally {
      setAccessToken(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
