export type ColorScheme = 'dark' | 'light';

export interface ColorTokens {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryText: string;
  danger: string;
  success: string;
}

// Dark is the default scheme; light is the override.
export const darkColors: ColorTokens = {
  background: '#0B0D10',
  surface: '#16191D',
  text: '#F5F6F7',
  textMuted: '#A0A6AD',
  border: '#2A2E33',
  primary: '#5B9DFF',
  primaryText: '#0B0D10',
  danger: '#FF6B6B',
  success: '#4CD787',
};

export const lightColors: ColorTokens = {
  background: '#FFFFFF',
  surface: '#F5F6F7',
  text: '#111417',
  textMuted: '#5B6168',
  border: '#DDE1E5',
  primary: '#1D5FD1',
  primaryText: '#FFFFFF',
  danger: '#C4302B',
  success: '#1E8E4F',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const typography = {
  body: { fontSize: 16, lineHeight: 22 },
  label: { fontSize: 14, lineHeight: 18 },
  heading: { fontSize: 20, lineHeight: 26 },
} as const;

export function colorsForScheme(scheme: ColorScheme): ColorTokens {
  return scheme === 'dark' ? darkColors : lightColors;
}
