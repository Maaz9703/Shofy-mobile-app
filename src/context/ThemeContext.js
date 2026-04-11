import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

const lightTheme = {
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  primary: '#4f46e5', // Indigo-600 for a more premium look
  primaryDark: '#4338ca',
  accent: '#06b6d4',
  border: '#f1f5f9', // Lighter border for subtle separation
  error: '#ef4444',
  success: '#10b981',
  radius: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 10,
    },
  }
};

const darkTheme = {
  background: '#09090b',
  card: '#18181b',
  cardGlass: 'rgba(255,255,255,0.04)',
  text: '#fafafa',
  textSecondary: '#a1a1aa',
  primary: '#fafafa',
  primaryDark: '#e4e4e7',
  border: '#27272a',
  error: '#ef4444',
  success: '#10b981',
};

export const ThemeProvider = ({ children }) => {
  const isDark = false; // Forced to false for premium light mode feel
  const theme = lightTheme;

  // No-op for toggleTheme since we force light mode
  const toggleTheme = () => {};

  const value = {
    theme,
    isDark,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
