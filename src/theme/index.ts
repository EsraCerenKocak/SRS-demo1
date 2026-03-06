export const colors = {
  primary: '#0A84FF', // vibrant blue
  primaryDark: '#005EBB',
  background: '#F2F2F7', // light background
  card: '#FFFFFF', // pure white card
  text: '#1C1C1E', // almost black text
  textSecondary: '#8E8E93', // subtle gray
  success: '#34C759', // vibrant green
  danger: '#FF3B30', // vibrant red
  warning: '#FFCC00',
  border: '#E5E5EA',
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  header: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
  },
  title: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.text,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
};

export const shadows = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
};

export const theme = {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius: 12,
};
