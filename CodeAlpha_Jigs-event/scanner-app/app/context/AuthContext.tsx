/**
 * Auth context — manages authentication state across the app.
 * Provides login, logout, and auto-login via stored JWT tokens.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../utils/constants';
import * as authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  error: null,
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Auto-login on mount ─────────────────────────────────────────────
  useEffect(() => {
    const tryAutoLogin = async () => {
      try {
        const tokens = await authService.getStoredTokens();
        if (!tokens) {
          setIsLoading(false);
          return;
        }

        // Try to fetch profile to validate token
        const storedUser = await authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }

        // Attempt to validate with server (non-blocking)
        try {
          const freshProfile = await authService.getProfile();
          setUser(freshProfile);
        } catch {
          // Token might be expired but storedUser is still set
          // The API interceptor will handle refresh
        }
      } catch {
        // Auto-login failed — user needs to log in manually
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    tryAutoLogin();
  }, []);

  // ─── Login ───────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
    } catch (err: any) {
      const message =
        err.message ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Login failed. Please check your credentials.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Logout ──────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  // ─── Clear error ─────────────────────────────────────────────────────
  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
