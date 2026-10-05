import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from './types';
import { getCurrentUser, loginUser, logoutUser, registerUser, initializeData } from './store';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => User | null;
  logout: () => void;
  register: (user: User) => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    initializeData();
    setUser(getCurrentUser());
  }, []);

  const login = (email: string, password: string) => {
    const u = loginUser(email, password);
    if (u) setUser(u);
    return u;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const register = (newUser: User) => {
    registerUser(newUser);
  };

  const refreshUser = () => {
    setUser(getCurrentUser());
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
