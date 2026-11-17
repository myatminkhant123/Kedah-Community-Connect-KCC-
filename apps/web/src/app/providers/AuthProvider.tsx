import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { PublicUser } from '@kcc/shared';
import { apiRequest, setCsrfToken } from '../../lib/api-client.js';

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<PublicUser>;
  register: (email: string, displayName: string, password: string) => Promise<PublicUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiRequest<{ user: PublicUser; csrfToken: string }>('/auth/me');
      setUser(data.user);
      setCsrfToken(data.csrfToken);
    } catch {
      setUser(null);
      setCsrfToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiRequest<{ user: PublicUser; csrfToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setUser(data.user);
    setCsrfToken(data.csrfToken);
    return data.user;
  }, []);

  const register = useCallback(async (email: string, displayName: string, password: string) => {
    const data = await apiRequest<{ user: PublicUser; csrfToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, displayName, password }),
    });
    setUser(data.user);
    setCsrfToken(data.csrfToken);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setCsrfToken(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
