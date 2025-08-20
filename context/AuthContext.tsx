
import React, { createContext, useState, ReactNode, useEffect } from 'react';
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem('trekly-user');
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error reading from localStorage', error);
    }
  }, []);

  const login = (name: string) => {
    const userId = `user_${Date.now()}`;
    const newUser: User = {
      id: userId,
      name: name,
      avatarUrl: `https://i.pravatar.cc/150?u=${name}`,
      isOnboardingCompleted: false,
    };
    
    try {
        window.localStorage.setItem('trekly-user', JSON.stringify(newUser));
    } catch (error) {
        console.error('Error writing to localStorage', error);
    }
    setUser(newUser);
  };

  const updateUser = (updates: Partial<Omit<User, 'id'>>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      
      const updatedUser = { ...prevUser, ...updates };

      // If name is part of the update, also update the avatar URL
      if (updates.name) {
          updatedUser.avatarUrl = `https://i.pravatar.cc/150?u=${updates.name}`;
      }
      
      try {
        window.localStorage.setItem('trekly-user', JSON.stringify(updatedUser));
      } catch (error) {
          console.error('Error writing to localStorage', error);
      }
      return updatedUser;
    });
  };
  
  const completeOnboarding = () => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, isOnboardingCompleted: true };
      try {
        window.localStorage.setItem('trekly-user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Error writing to localStorage', error);
      }
      return updatedUser;
    });
  };

  const logout = () => {
    try {
        window.localStorage.removeItem('trekly-user');
    } catch (error) {
        console.error('Error removing from localStorage', error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};