import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { User } from '../types';
import { authAPI, RegisterPayload } from '../utils/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sessionToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('session_token');

      if (token) {
        setSessionToken(token);
        const userData = await authAPI.getMe(token);
        setUser(userData);
      }
    } catch (error) {
      console.log('Not authenticated');
      setUser(null);
      setSessionToken(null);
      await AsyncStorage.removeItem('session_token');
    } finally {
      setLoading(false);
    }
  };

  const storeAuthenticatedUser = async (response: any) => {
    const realSessionToken = response.session_token;

    if (!realSessionToken) {
      throw new Error('El servidor no devolvió un token de sesión');
    }

    await AsyncStorage.setItem('session_token', realSessionToken);
    setSessionToken(realSessionToken);

    const userData = await authAPI.getMe(realSessionToken);
    setUser(userData);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({
        email: email.trim().toLowerCase(),
        password,
      });

      await storeAuthenticatedUser(response);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterPayload) => {
    try {
      await authAPI.register({
        username: data.username.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        password: data.password,
        confirm_password: data.confirm_password,
      });
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout(sessionToken || undefined);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setSessionToken(null);
      await AsyncStorage.removeItem('session_token');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        sessionToken,
        login,
        register,
        logout,
        updateUser,
      }}
    >
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
