'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types/auth';
import {
  getStoredToken,
  loginUser,
  logoutUser,
  fetchCurrentUser,
} from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getStoredToken();
      if (storedToken) {
        setToken(storedToken);
        try {
          const profile = await fetchCurrentUser(storedToken);
          setUser(profile);
        } catch (err) {
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const { tokens, user: profile } = await loginUser(email, password);
    setToken(tokens.access_token);
    setUser(profile);
    return profile;
  };

  const logout = async (): Promise<void> => {
    await logoutUser();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async (): Promise<void> => {
    if (token) {
      try {
        const profile = await fetchCurrentUser(token);
        setUser(profile);
      } catch (err) {
        setUser(null);
        setToken(null);
      }
    }
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
