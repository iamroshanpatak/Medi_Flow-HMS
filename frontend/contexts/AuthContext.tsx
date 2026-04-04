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
      const err = error as { response?: { data?: { message?: string } } | any; message?: string };
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      console.error('Login error:', errorMessage, error);
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
      const err = error as { response?: { data?: { message?: string } } | any; message?: string };
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      console.error('Registration error:', errorMessage, error);
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
      const err = error as { response?: { data?: { message?: string } } | any; message?: string };
      const errorMessage = err.response?.data?.message || err.message || 'Profile update failed';
      console.error('Profile update error:', errorMessage, error);
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
