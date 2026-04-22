'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, getToken, setToken } from './api';
import type { AuthResponse, User } from './types';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<User>('/users/me');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* noop */
    }
    setToken(null);
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside <AuthProvider>');
  return v;
}
