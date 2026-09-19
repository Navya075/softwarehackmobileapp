// Base Dark Colors (Default approved palette)
export const darkColors = {
  background: '#0B0F14',
  surface: '#151C26',
  surfaceElevated: '#1C2533',
  surfaceHighlight: '#243042',
  surfaceBorder: '#293547',
  surfaceBorderSubtle: '#1F2937',

  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0B0F14',

  primary: '#10B981', // Muted clean emerald
  primaryMuted: '#059669',
  primaryDark: '#064E3B',
  primaryLight: '#34D399',
  primaryGhost: 'rgba(16, 185, 129, 0.12)',

  solar: '#F59E0B', // Warm soft amber
  solarLight: '#FBBF24',
  solarDark: '#78350F',
  solarGhost: 'rgba(245, 158, 11, 0.12)',

  grid: '#38BDF8', // Electric cool blue
  gridMuted: '#0284C7',
  gridGhost: 'rgba(56, 189, 248, 0.12)',

  success: '#10B981',
  successGhost: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B',
  warningGhost: 'rgba(245, 158, 11, 0.15)',
  danger: '#EF4444',
  dangerGhost: 'rgba(239, 68, 68, 0.15)',
  info: '#38BDF8',
  infoGhost: 'rgba(56, 189, 248, 0.15)',

  inputBackground: '#131A24',
  inputBorder: '#2A3649',
  inputFocusBorder: '#10B981',
  buttonDisabled: '#1E293B',
  buttonDisabledText: '#475569',
};

// Light Mode Colors (Clean accessible translation using exact same tokens)
export const lightColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  surfaceHighlight: '#E2E8F0',
  surfaceBorder: '#CBD5E1',
  surfaceBorderSubtle: '#E2E8F0',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textInverse: '#FFFFFF',

  primary: '#059669',
  primaryMuted: '#047857',
  primaryDark: '#064E3B',
  primaryLight: '#10B981',
  primaryGhost: 'rgba(5, 150, 105, 0.12)',

  solar: '#D97706',
  solarLight: '#F59E0B',
  solarDark: '#78350F',
  solarGhost: 'rgba(217, 119, 6, 0.12)',

  grid: '#0284C7',
  gridMuted: '#0369A1',
  gridGhost: 'rgba(2, 132, 199, 0.12)',

  success: '#059669',
  successGhost: 'rgba(5, 150, 105, 0.12)',
  warning: '#D97706',
  warningGhost: 'rgba(217, 119, 6, 0.12)',
  danger: '#DC2626',
  dangerGhost: 'rgba(220, 38, 38, 0.12)',
  info: '#0284C7',
  infoGhost: 'rgba(2, 132, 199, 0.12)',

  inputBackground: '#FFFFFF',
  inputBorder: '#CBD5E1',
  inputFocusBorder: '#059669',
  buttonDisabled: '#E2E8F0',
  buttonDisabledText: '#94A3B8',
};

// Default export is darkColors for backwards-compatibility
export const colors = darkColors;
export type Colors = typeof darkColors;
