'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/services/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin' | 'staff';
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  profileImage?: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  dateOfBirth?: string | undefined;
  gender?: string | undefined;
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data.data);
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error('Invalid response from server: missing token or user data');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      // Redirect based on role
      router.push(`/${user.role}/dashboard`);
    } catch (error: unknown) {
      let errorMessage = 'Login failed';
      let statusCode: number | undefined;
      let errorCode: string | undefined;
      
      // Handle different error types
      if (error instanceof Error) {
        // Standard Error object
        if (error.message.includes('Network Error')) {
          errorMessage = `🔴 Cannot connect to backend at ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}. Make sure it's running.`;
        } else if (error.message.includes('ECONNREFUSED')) {
          errorMessage = '🔴 Backend connection refused. Ensure backend is running on port 5001.';
        } else {
          errorMessage = error.message || 'Login failed';
        }
      } else if (typeof error === 'object' && error !== null) {
        const err = error as Record<string, unknown>;
        statusCode = (err.response as Record<string, unknown>)?.status as number;
        errorCode = err.code as string;
        
        if (err.isNetworkError) {
          errorMessage = `🔴 Network Error: ${err.message}`;
        } else if (statusCode === 401) {
          errorMessage = '❌ Invalid email or password';
        } else if (statusCode === 500) {
          errorMessage = '❌ Server error. Please try again later.';
        } else if ((err.response as Record<string, unknown>)?.data?.message) {
          errorMessage = ((err.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message as string;
        } else if (err.message) {
          errorMessage = err.message as string;
        }
      }
      
      console.error('Login Error Details:', {
        message: errorMessage,
        statusCode,
        errorCode,
        apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
        timestamp: new Date().toISOString(),
        originalError: error,
      });
      
      throw new Error(errorMessage);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      console.log('Registering user with data:', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        gender: data.gender,
      });

      const response = await authAPI.register(data);
      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error('Invalid response from server: missing token or user data');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      // Redirect based on role
      router.push(`/${user.role}/dashboard`);
    } catch (error: unknown) {
      let errorMessage = 'Registration failed';
      let statusCode: number | undefined;
      let errorCode: string | undefined;
      
      // Handle different error types
      if (error instanceof Error) {
        // Standard Error object
        if (error.message.includes('Network Error')) {
          errorMessage = `🔴 Cannot connect to backend at ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}. Make sure it's running.`;
        } else if (error.message.includes('ECONNREFUSED')) {
          errorMessage = '🔴 Backend connection refused. Ensure backend is running on port 5001.';
        } else {
          errorMessage = error.message || 'Registration failed';
        }
      } else if (typeof error === 'object' && error !== null) {
        const err = error as Record<string, unknown>;
        statusCode = (err.response as Record<string, unknown>)?.status as number;
        errorCode = err.code as string;
        
        if (err.isNetworkError) {
          errorMessage = `🔴 Network Error: ${err.message}`;
        } else if (statusCode === 400) {
          errorMessage = ((err.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message as string || '❌ Invalid registration data. Email may already exist.';
        } else if (statusCode === 500) {
          errorMessage = '❌ Server error. Please try again later.';
        } else if ((err.response as Record<string, unknown>)?.data?.message) {
          errorMessage = ((err.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message as string;
        } else if (err.message) {
          errorMessage = err.message as string;
        }
      }
      
      console.error('Registration Error Details:', {
        message: errorMessage,
        statusCode,
        errorCode,
        apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
        timestamp: new Date().toISOString(),
        originalError: error,
      });
      
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data.data);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    } catch (error: unknown) {
      let errorMessage = 'Profile update failed';
      let statusCode: number | undefined;
      let errorCode: string | undefined;
      
      // Handle different error types
      if (error instanceof Error) {
        // Standard Error object
        if (error.message.includes('Network Error')) {
          errorMessage = `🔴 Cannot connect to backend at ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}. Make sure it's running.`;
        } else if (error.message.includes('ECONNREFUSED')) {
          errorMessage = '🔴 Backend connection refused. Ensure backend is running on port 5001.';
        } else {
          errorMessage = error.message || 'Profile update failed';
        }
      } else if (typeof error === 'object' && error !== null) {
        const err = error as Record<string, unknown>;
        statusCode = (err.response as Record<string, unknown>)?.status as number;
        errorCode = err.code as string;
        
        if (err.isNetworkError) {
          errorMessage = `🔴 Network Error: ${err.message}`;
        } else if (statusCode === 400) {
          errorMessage = ((err.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message as string || '❌ Invalid data provided.';
        } else if (statusCode === 500) {
          errorMessage = '❌ Server error. Please try again later.';
        } else if ((err.response as Record<string, unknown>)?.data?.message) {
          errorMessage = ((err.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message as string;
        } else if (err.message) {
          errorMessage = err.message as string;
        }
      }
      
      console.error('Profile Update Error Details:', {
        message: errorMessage,
        statusCode,
        errorCode,
        apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
        timestamp: new Date().toISOString(),
        originalError: error,
      });
      
      throw new Error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
