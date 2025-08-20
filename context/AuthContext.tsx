
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (name: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<Omit<User, 'id'>>) => void;
  completeOnboarding: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'trekly-user';
const isWeb = typeof window !== 'undefined' && typeof (window as any).localStorage !== 'undefined' && typeof (window as any).document !== 'undefined';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (isWeb) {
          const storedUser = window.localStorage.getItem(STORAGE_KEY);
          if (storedUser) {
            const parsedUser: User = JSON.parse(storedUser);
            setUser(parsedUser);
          }
        } else {
          const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
          if (storedUser) {
            const parsedUser: User = JSON.parse(storedUser);
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error('Error loading user from storage', error);
      }
    };

    // no await in useEffect
    loadUser();
  }, []);

  const persistUser = (value: User | null) => {
    try {
      if (value) {
        const json = JSON.stringify(value);
        if (isWeb) {
          window.localStorage.setItem(STORAGE_KEY, json);
        } else {
          // fire-and-forget; we don't await to keep the signature synchronous
          AsyncStorage.setItem(STORAGE_KEY, json).catch(err => console.error('AsyncStorage setItem error', err));
        }
      } else {
        if (isWeb) {
          window.localStorage.removeItem(STORAGE_KEY);
        } else {
          AsyncStorage.removeItem(STORAGE_KEY).catch(err => console.error('AsyncStorage removeItem error', err));
        }
      }
    } catch (error) {
      console.error('Error persisting user to storage', error);
    }
  };

  const login = (name: string) => {
    const userId = `user_${Date.now()}`;
    const newUser: User = {
      id: userId,
      name: name,
      avatarUrl: `https://i.pravatar.cc/150?u=${name}`,
      isOnboardingCompleted: false,
    };

    persistUser(newUser);
    setUser(newUser);
  };

  const updateUser = (updates: Partial<Omit<User, 'id'>>) => {
    setUser(prevUser => {
      if (!prevUser) return null;

      const updatedUser: User = { ...prevUser, ...updates };

      if (updates.name) {
        updatedUser.avatarUrl = `https://i.pravatar.cc/150?u=${updates.name}`;
      }

      persistUser(updatedUser);
      return updatedUser;
    });
  };

  const completeOnboarding = () => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser: User = { ...prevUser, isOnboardingCompleted: true };
      persistUser(updatedUser);
      return updatedUser;
    });
  };

  const logout = () => {
    persistUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};