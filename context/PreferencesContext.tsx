import React, { createContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Preferences } from '../types';

interface PreferencesContextType {
  preferences: Preferences;
  setPreferences: (prefs: Preferences) => void;
}

export const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined
);

const defaultPreferences: Preferences = {
  theme: 'light',
  unitSystem: 'metric',
};

const STORAGE_KEY = 'trekly-preferences';
const isWeb =
  typeof window !== 'undefined' &&
  typeof (window as any).localStorage !== 'undefined' &&
  typeof (window as any).document !== 'undefined';

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);

  // Load on mount
  useEffect(() => {
    const load = async () => {
      try {
        if (isWeb) {
          const stored = window.localStorage.getItem(STORAGE_KEY);
          if (stored) {
            setPreferences(JSON.parse(stored));
          }
        } else {
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          if (stored) {
            setPreferences(JSON.parse(stored));
          }
        }
      } catch (err) {
        console.error('Error loading preferences from storage', err);
      }
    };
    load();
  }, []);

  // Persist on change
  useEffect(() => {
    const persist = async () => {
      try {
        const json = JSON.stringify(preferences);
        if (isWeb) {
          window.localStorage.setItem(STORAGE_KEY, json);
        } else {
          await AsyncStorage.setItem(STORAGE_KEY, json);
        }
      } catch (err) {
        console.error('Error saving preferences to storage', err);
      }
    };
    persist();
  }, [preferences]);

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}
