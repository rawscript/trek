import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#10B981', // brand-green
    secondary: '#3B82F6', // brand-blue
    surface: '#FFFFFF',
    background: '#F9FAFB', // brand-light
    text: {
      primary: '#1F2937', // brand-dark
      secondary: '#6B7280', // brand-gray
    },
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#10B981',
    secondary: '#3B82F6',
    surface: '#1F2937',
    background: '#111827', // brand-dark
    text: {
      primary: '#F9FAFB',
      secondary: '#9CA3AF',
    },
    border: '#374151',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
};

export const theme = lightTheme; // Default theme

export const colors = {
  primary: '#10B981',
  secondary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  light: '#F9FAFB',
  dark: '#1F2937',
  gray: '#6B7280',
  white: '#FFFFFF',
  black: '#000000',
};