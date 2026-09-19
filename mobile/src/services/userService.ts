import { apiClient } from './apiClient';

export interface BackendUserProfile {
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  building_name?: string;
  unit_number?: string;
  locality?: string;
  city?: string;
  pincode?: string;
  has_home_charger?: boolean;
  context: 'residential' | 'commercial';
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserUpdateParams {
  name?: string;
  phone?: string;
  address?: string;
  building_name?: string;
  unit_number?: string;
  locality?: string;
  city?: string;
  pincode?: string;
  has_home_charger?: boolean;
  context?: 'residential' | 'commercial';
  onboarding_completed?: boolean;
}

export const userService = {
  async getProfile(): Promise<BackendUserProfile> {
    return await apiClient.get<BackendUserProfile>('/api/users/me');
  },

  async updateProfile(updates: UserUpdateParams): Promise<BackendUserProfile> {
    return await apiClient.put<BackendUserProfile>('/api/users/me', updates);
  },

  async switchContext(context: 'residential' | 'commercial'): Promise<BackendUserProfile> {
    return await apiClient.post<BackendUserProfile>('/api/users/switch-context', { context });
  },
};
