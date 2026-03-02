export const brand = {
  primary: '#FF2E63',
  primaryEnd: '#FF6B8A',
  dark: '#0B0B18',
  darkEnd: '#1A1A2E',
  white: '#FFFFFF',
  muted: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  accent: '#73A9CA',
} as const;

export const gradients = {
  primary: 'linear-gradient(135deg, #FF2E63, #FF6B8A)',
  dark: 'linear-gradient(180deg, #0B0B18, #1A1A2E)',
} as const;

// Backward compatibility — maps old token names to new brand tokens
export const colors = {
  primary: brand.primary,
  secondary: brand.success,
  accent: brand.accent,
  background: brand.darkEnd,
} as const;

export const appBarIconColors = {
  primary: brand.white,
  secondary: brand.dark,
  accent: brand.accent,
} as const;
