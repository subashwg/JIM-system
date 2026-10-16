import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch (err) {
      console.warn('Failed to fetch current user session', err);
      api.setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleAuthExpired = () => {
      setUser(null);
    };

    window.addEventListener('jim_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('jim_auth_expired', handleAuthExpired);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName?: string) => {
    setIsLoading(true);
    try {
      const res = await api.register({ email, password, displayName });
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
