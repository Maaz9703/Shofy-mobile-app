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
  cardGlass: 'rgba(0,0,0,0.03)',
  text: '#0f172a',
  textSecondary: '#64748b',
  primary: '#7c3aed',
  primaryDark: '#6d28d9',
  border: '#e2e8f0',
  error: '#ef4444',
  success: '#10b981',
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
