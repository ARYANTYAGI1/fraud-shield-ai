'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/verify-email', '/reset-password'];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    try {
      const res = await api.get('/profile');
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        // Verify token with profile fetch in background
        refreshUser();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Protect client side routes
  useEffect(() => {
    if (!loading) {
      const token = localStorage.getItem('accessToken');
      const isPublic = PUBLIC_ROUTES.includes(pathname || '');

      if (!token && !isPublic) {
        router.push('/login');
      } else if (token && isPublic && pathname !== '/' && pathname !== '/verify-email' && pathname !== '/reset-password') {
        router.push('/dashboard');
      }
    }
  }, [pathname, user, loading, router]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: loggedUser, accessToken, refreshToken } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      router.push('/dashboard');
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.response?.data?.message || 'Login failed. Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { user: loggedUser, accessToken, refreshToken } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      router.push('/dashboard');
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        refreshUser,
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
export default AuthContext;
