import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sessionToken: string | null;
  login: (sessionId: string) => Promise<void>;
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
      // Check if we have a stored session token
      const token = await AsyncStorage.getItem('session_token');
      if (token) {
        setSessionToken(token);
        const userData = await authAPI.getMe(token);
        setUser(userData);
      }
    } catch (error) {
      console.log('Not authenticated');
      await AsyncStorage.removeItem('session_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (sessionId: string) => {
    try {
      const userData = await authAPI.createSession(sessionId);
      setUser(userData);
      // Note: Session token is set in httpOnly cookie by backend
      // For mobile, we'll need to handle it differently
      // For now, we'll use a dummy token and rely on cookies
      const token = `mobile_session_${Date.now()}`;
      await AsyncStorage.setItem('session_token', token);
      setSessionToken(token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
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
    <AuthContext.Provider value={{ user, loading, sessionToken, login, logout, updateUser }}>
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