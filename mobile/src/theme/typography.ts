import { TextStyle } from 'react-native';
import { colors } from './colors';

export const typography: Record<string, TextStyle> = {
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    color: colors.textPrimary,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: colors.textMuted,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  caption: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  statNumber: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  statUnit: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: colors.textSecondary,
  },
};
