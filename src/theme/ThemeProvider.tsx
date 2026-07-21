import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ColorScheme, ColorTokens, colorsForScheme, spacing, typography } from './tokens';

export interface Theme {
  scheme: ColorScheme;
  colors: ColorTokens;
  spacing: typeof spacing;
  typography: typeof typography;
}

const ThemeContext = createContext<Theme | null>(null);

export interface ThemeProviderProps {
  /** Overrides the OS color scheme. Defaults to dark when the OS reports no preference. */
  scheme?: ColorScheme;
  children: React.ReactNode;
}

export function ThemeProvider({ scheme, children }: ThemeProviderProps): React.JSX.Element {
  const osScheme = useColorScheme();
  const resolvedScheme: ColorScheme = scheme ?? (osScheme === 'light' ? 'light' : 'dark');

  const theme = useMemo<Theme>(
    () => ({
      scheme: resolvedScheme,
      colors: colorsForScheme(resolvedScheme),
      spacing,
      typography,
    }),
    [resolvedScheme]
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
}
