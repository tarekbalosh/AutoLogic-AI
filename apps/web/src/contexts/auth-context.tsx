'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { AuthResponse, LoginDto, RegisterDto } from '@ai-support-hub/shared';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  loading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = Cookies.get('accessToken');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (dto: LoginDto) => {
    const { data } = await api.post<AuthResponse>('/auth/login', dto);
    handleAuthSuccess(data);
  };

  const register = async (dto: RegisterDto) => {
    const { data } = await api.post<AuthResponse>('/auth/register', dto);
    handleAuthSuccess(data);
  };

  const handleAuthSuccess = (data: AuthResponse) => {
    setUser(data.user);
    Cookies.set('accessToken', data.accessToken, { expires: 1/96 }); // 15 mins
    Cookies.set('refreshToken', data.refreshToken, { expires: 7 });
    localStorage.setItem('user', JSON.stringify(data.user));
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
