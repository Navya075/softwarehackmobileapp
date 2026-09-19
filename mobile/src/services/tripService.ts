import { apiClient } from './apiClient';

export interface BackendTripItem {
  trip_id: string;
  user_id: string;
  vehicle_id: string;
  origin: string;
  destination: string;
  distance_km: number;
  current_range_km: number;
  recommended_target_soc: number;
  additional_energy_required_kwh: number;
  estimated_charging_time_min: number;
  created_at: string;
}

export interface CreateTripParams {
  vehicle_id: string;
  origin: string;
  destination: string;
  distance_km: number;
}

export const tripService = {
  async getTrips(): Promise<BackendTripItem[]> {
    return await apiClient.get<BackendTripItem[]>('/api/trips');
  },

  async createTrip(params: CreateTripParams): Promise<BackendTripItem> {
    return await apiClient.post<BackendTripItem>('/api/trips', params);
  },

  async deleteTrip(tripId: string): Promise<void> {
    await apiClient.delete(`/api/trips/${tripId}`);
  },
};
