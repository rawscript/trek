import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Preferences, Theme, UnitSystem } from '../types';

interface PreferencesContextType {
  preferences: Preferences;
  setPreferences: (prefs: Preferences) => void;
}

export const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const defaultPreferences: Preferences = {
  theme: 'light',
  unitSystem: 'metric',
};

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      const storedPrefs = window.localStorage.getItem('trekly-preferences');
      return storedPrefs ? JSON.parse(storedPrefs) : defaultPreferences;
    } catch (error) {
      console.error('Error reading preferences from localStorage', error);
      return defaultPreferences;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('trekly-preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences to localStorage', error);
    }
  }, [preferences]);

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};
