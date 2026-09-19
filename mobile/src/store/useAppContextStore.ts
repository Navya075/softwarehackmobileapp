import { create } from 'zustand';
import { darkColors, lightColors, Colors } from '../theme/colors';

export type ChargingContextType = 'residential' | 'commercial';
export type ThemeModeType = 'dark' | 'light' | 'system';

interface AppContextState {
  // Context: Residential vs Commercial / Industrial
  chargingContext: ChargingContextType;
  setChargingContext: (context: ChargingContextType) => void;
  toggleChargingContext: () => void;

  // Theme: Dark vs Light vs System
  themeMode: ThemeModeType;
  setThemeMode: (mode: ThemeModeType) => void;
  getColors: () => Colors;

  // "I'm Leaving Early" feature state
  leavingEarlyActive: boolean;
  leavingEarlyMinutes: number;
  setLeavingEarly: (minutes: number) => void;
  cancelLeavingEarly: () => void;

  // Commercial / Industrial Stay Duration & Smart Queue
  stayDurationMinutes: number;
  setStayDurationMinutes: (minutes: number) => void;
  queueJoined: boolean;
  queuePosition: number;
  estimatedWaitMinutes: number;
  joinQueue: () => void;
  leaveQueue: () => void;
}

export const useAppContextStore = create<AppContextState>((set, get) => ({
  chargingContext: 'residential',
  setChargingContext: (context) => set({ chargingContext: context }),
  toggleChargingContext: () =>
    set((s) => ({ chargingContext: s.chargingContext === 'residential' ? 'commercial' : 'residential' })),

  themeMode: 'dark',
  setThemeMode: (mode) => set({ themeMode: mode }),
  getColors: () => {
    const { themeMode } = get();
    if (themeMode === 'light') return lightColors;
    return darkColors;
  },

  leavingEarlyActive: false,
  leavingEarlyMinutes: 30,
  setLeavingEarly: (minutes) =>
    set({ leavingEarlyActive: true, leavingEarlyMinutes: minutes }),
  cancelLeavingEarly: () =>
    set({ leavingEarlyActive: false, leavingEarlyMinutes: 30 }),

  stayDurationMinutes: 120, // 2 hours default for commercial
  setStayDurationMinutes: (minutes) => set({ stayDurationMinutes: minutes }),
  queueJoined: false,
  queuePosition: 3,
  estimatedWaitMinutes: 18,
  joinQueue: () => set({ queueJoined: true }),
  leaveQueue: () => set({ queueJoined: false }),
}));
