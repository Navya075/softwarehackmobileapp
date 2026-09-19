import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';
import { authService } from '../services/firebase/authService';
import { userService, BackendUserProfile } from '../services/userService';
import { useVehicleStore } from './useVehicleStore';

const USER_STORAGE_KEY = '@voltflow_user_profile';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  fetchProfile: () => Promise<UserProfile | null>;
  updateProfile: (updates: {
    displayName?: string;
    phone?: string;
    address?: string;
    propertyType?: 'residential' | 'commercial';
  }) => Promise<UserProfile>;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (data: Partial<UserProfile>) => Promise<void>;
}

function mapBackendToUserProfile(p: BackendUserProfile, fallbackEmail?: string): UserProfile {
  return {
    id: p.user_id,
    email: p.email || fallbackEmail || 'user@voltflow.io',
    displayName: p.name || 'EV Owner',
    phone: p.phone,
    address: p.address,
    buildingName: p.building_name,
    unitNumber: p.unit_number,
    locality: p.locality,
    city: p.city,
    pincode: p.pincode,
    hasHomeCharger: p.has_home_charger ?? true,
    propertyType: p.context || 'residential',
    costPriority: 'balanced',
    completedOnboarding: p.onboarding_completed ?? true,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isOnboarded: false,
  isLoading: true,

  initialize: async () => {
    set({ isLoading: true });

    // 1. Fast local cache load for UI responsiveness
    try {
      const stored = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile;
        set({
          user: parsed,
          isAuthenticated: true,
          isOnboarded: parsed.completedOnboarding ?? true,
        });
      }
    } catch {
      // ignore
    }

    // 2. React to Firebase Auth state as the single source of truth
    authService.onUserChanged(async (fbUser) => {
      if (fbUser) {
        try {
          const backendProfile = await userService.getProfile();
          const user: UserProfile = {
            id: fbUser.uid,
            email: fbUser.email || get().user?.email || '',
            displayName: backendProfile?.name || fbUser.displayName || get().user?.displayName || 'EV Owner',
            phone: backendProfile?.phone || get().user?.phone,
            address: backendProfile?.address || get().user?.address,
            propertyType: (backendProfile?.context as any) || get().user?.propertyType || 'residential',
            costPriority: 'balanced',
            completedOnboarding: backendProfile?.onboarding_completed ?? get().user?.completedOnboarding ?? true,
          };
          set({
            user,
            isAuthenticated: true,
            isOnboarded: user.completedOnboarding,
            isLoading: false,
          });
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        } catch {
          const fallbackUser: UserProfile = get().user || {
            id: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'EV Owner',
            propertyType: 'residential',
            costPriority: 'balanced',
            completedOnboarding: true,
          };
          set({
            user: fallbackUser,
            isAuthenticated: true,
            isOnboarded: fallbackUser.completedOnboarding,
            isLoading: false,
          });
        }
      } else {
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
        await AsyncStorage.removeItem('@voltflow_active_vehicle');
        useVehicleStore.getState().resetVehicleState();
        set({
          user: null,
          isAuthenticated: false,
          isOnboarded: false,
          isLoading: false,
        });
      }
    });
  },

  fetchProfile: async () => {
    try {
      const backendProfile = await userService.getProfile();
      if (backendProfile) {
        const user = mapBackendToUserProfile(backendProfile, get().user?.email);
        set({
          user,
          isAuthenticated: true,
          isOnboarded: user.completedOnboarding,
        });
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        return user;
      }
    } catch (e) {
      // preserve local user
    }
    return get().user;
  },

  updateProfile: async (updates) => {
    set({ isLoading: true });
    const current = get().user;
    if (!current) {
      set({ isLoading: false });
      throw new Error('Not authenticated');
    }
    try {
      const backendRes = await userService.updateProfile({
        name: updates.displayName,
        phone: updates.phone,
        address: updates.address,
        context: updates.propertyType,
      });

      const updatedUser: UserProfile = {
        ...current,
        ...updates,
        id: backendRes.user_id || current.id,
        email: backendRes.email || current.email,
        displayName: backendRes.name || updates.displayName || current.displayName,
        phone: backendRes.phone ?? updates.phone ?? current.phone,
        address: backendRes.address ?? updates.address ?? current.address,
        propertyType: backendRes.context || updates.propertyType || current.propertyType,
      };

      set({ user: updatedUser, isLoading: false });
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (e) {
      const updatedUser: UserProfile = {
        ...current,
        ...updates,
        displayName: updates.displayName || current.displayName,
        phone: updates.phone ?? current.phone,
        address: updates.address ?? current.address,
        propertyType: updates.propertyType || current.propertyType,
      };
      set({ user: updatedUser, isLoading: false });
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    }
  },

  login: async (email: string, pass: string) => {
    set({ isLoading: true });
    try {
      const fbUserProfile = await authService.signIn(email, pass);
      let profile = fbUserProfile;
      try {
        const backendProfile = await userService.getProfile();
        if (backendProfile) {
          profile = mapBackendToUserProfile(backendProfile, email);
        }
      } catch {
        // use fbUserProfile
      }

      set({
        user: profile,
        isAuthenticated: true,
        isOnboarded: profile.completedOnboarding,
        isLoading: false,
      });
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  signup: async (name: string, email: string, pass: string, phone?: string) => {
    set({ isLoading: true });
    try {
      const fbUserProfile = await authService.signUp(email, pass, name);

      const user: UserProfile = {
        ...fbUserProfile,
        displayName: name.trim() || fbUserProfile.displayName,
        phone: phone ? phone.trim() : undefined,
        completedOnboarding: false,
      };

      set({
        user,
        isAuthenticated: true,
        isOnboarded: false,
      });
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

      try {
        await userService.updateProfile({
          name: name.trim(),
          phone: phone ? phone.trim() : undefined,
          onboarding_completed: false,
        });
      } catch {
        // ignore
      }

      set({ isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.signOut();
    } catch (e) {
      console.warn('Firebase signOut notice:', e);
    }
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem('@voltflow_active_vehicle');
    } catch {
      // ignore
    }
    useVehicleStore.getState().resetVehicleState();
    set({
      user: null,
      isAuthenticated: false,
      isOnboarded: false,
      isLoading: false,
    });
  },

  completeOnboarding: async (data: Partial<UserProfile>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...data, completedOnboarding: true };
    set({ user: updated, isOnboarded: true });
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));

    try {
      await userService.updateProfile({
        name: updated.displayName,
        phone: updated.phone,
        address: updated.address,
        building_name: updated.buildingName,
        unit_number: updated.unitNumber,
        locality: updated.locality,
        city: updated.city,
        pincode: updated.pincode,
        has_home_charger: updated.hasHomeCharger ?? true,
        context: updated.propertyType,
        onboarding_completed: true,
      });
    } catch (e) {
      console.error('[AUTH STORE] completeOnboarding update failed:', e);
    }
  },
}));
