import { apiClient } from './apiClient';

export interface BackendCharger {
  charger_id: string;
  name: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  connector: string;
  charging_type: string;
  power_kw: number;
  price_per_kwh: number;
  parking_price_per_hour: number;
  status: 'available' | 'in_use' | 'offline' | 'reserved';
  total_slots: number;
  available_slots: number;
  is_solar_powered: boolean;
  context: 'residential' | 'commercial';
}

export interface BackendBookingSlot {
  slot_id: string;
  time_range: string;
  is_available: boolean;
  status_tag: string;
  tag_variant: 'neutral' | 'solar' | 'warning' | 'success';
  price_per_kwh: number;
}

export const chargerService = {
  async getChargers(params?: {
    context?: string;
    speed?: string;
    onlyAvailable?: boolean;
    search?: string;
  }): Promise<BackendCharger[]> {
    const query = new URLSearchParams();
    if (params?.context) query.append('context', params.context);
    if (params?.speed) query.append('speed', params.speed);
    if (params?.onlyAvailable) query.append('only_available', 'true');
    if (params?.search) query.append('search', params.search);

    const qs = query.toString();
    return await apiClient.get<BackendCharger[]>(`/api/chargers${qs ? `?${qs}` : ''}`);
  },

  async getCharger(chargerId: string): Promise<BackendCharger> {
    return await apiClient.get<BackendCharger>(`/api/chargers/${chargerId}`);
  },

  async getSlots(chargerId: string, date: string): Promise<BackendBookingSlot[]> {
    return await apiClient.get<BackendBookingSlot[]>(
      `/api/chargers/${chargerId}/slots?date=${encodeURIComponent(date)}`
    );
  },
};
