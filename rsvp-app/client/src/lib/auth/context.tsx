import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';

interface User {
  id: string;
  email: string;
  name: string;
  provider: string;
}

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
  refresh: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (): Promise<string | null> => {
    try {
      const { accessToken: token } = await authApi.refresh();
      setAccessToken(token);
      const me = await authApi.me(token);
      setUser(me);
      return token;
    } catch {
      setUser(null);
      setAccessToken(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const { accessToken: token } = await authApi.login(email, password);
    setAccessToken(token);
    const me = await authApi.me(token);
    setUser(me);
  };

  const register = async (email: string, name: string, password: string) => {
    const { accessToken: token } = await authApi.register(email, name, password);
    setAccessToken(token);
    const me = await authApi.me(token);
    setUser(me);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setAccessToken(null);
  };

  const setToken = (token: string) => {
    setAccessToken(token);
    authApi.me(token).then(setUser).catch(console.error);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, register, logout, setToken, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
