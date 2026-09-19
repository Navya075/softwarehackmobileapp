import { useAppContextStore } from '../store/useAppContextStore';
import { darkColors, lightColors, Colors } from './colors';

export function useThemeColors(): Colors {
  const themeMode = useAppContextStore((s) => s.themeMode);
  if (themeMode === 'light') return lightColors;
  return darkColors;
}
