import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from './types';
import { getCurrentUser, loginUser, loginUserAsync, logoutUser, registerUser, registerUserAsync, initializeData, isApiAvailable } from './store';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  register: (data: { name: string; email: string; password: string; phone?: string; address?: string }) => Promise<{ id: string }>;
  refreshUser: () => void;
  apiMode: 'api' | 'local';
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    initializeData();
    setUser(getCurrentUser());
  }, []);

  const login = async (email: string, password: string) => {
    let u: User | null;
    if (isApiAvailable()) {
      u = await loginUserAsync(email, password);
    } else {
      u = loginUser(email, password);
    }
    if (u) setUser(u);
    return u;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string; address?: string }) => {
    return await registerUserAsync(data);
  };

  const refreshUser = () => {
    setUser(getCurrentUser());
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, refreshUser, apiMode: isApiAvailable() ? 'api' : 'local' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
