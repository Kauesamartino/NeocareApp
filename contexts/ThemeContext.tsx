import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

const lightColors = {
  background: '#f8f9fa',
  surface: '#ffffff',
  card: '#ffffff',
  primary: '#2196F3',
  primaryDark: '#1565C0',
  text: '#1a1a2e',
  textSecondary: '#666666',
  border: '#e0e0e0',
  inputBackground: '#f5f5f5',
  danger: '#F44336',
  warning: '#FF9800',
  success: '#4CAF50',
  statusBar: 'dark' as const,
};

const darkColors = {
  background: '#121212',
  surface: '#1e1e1e',
  card: '#2c2c2c',
  primary: '#64b5f6',
  primaryDark: '#1565C0',
  text: '#f5f5f5',
  textSecondary: '#aaaaaa',
  border: '#333333',
  inputBackground: '#2a2a2a',
  danger: '#ef5350',
  warning: '#ffa726',
  success: '#66bb6a',
  statusBar: 'light' as const,
};

export type ThemeColors = {
  background: string;
  surface: string;
  card: string;
  primary: string;
  primaryDark: string;
  text: string;
  textSecondary: string;
  border: string;
  inputBackground: string;
  danger: string;
  warning: string;
  success: string;
  statusBar: 'light' | 'dark';
};

export type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  scheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const scheme: ColorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const colors = scheme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ scheme, colors, isDark: scheme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
};
