import { apiClient } from './apiClient';

export interface BackendChargingPreferences {
  user_id: string;
  target_soc: number;
  departure_date: string;
  departure_time: string;
  prefer_renewable: boolean;
  prefer_lower_cost: boolean;
  allow_smart_charging: boolean;
  allow_charging_delay: boolean;
  emergency_charging: boolean;
  charge_faster: boolean;
  departure_readiness_guarantee: boolean;
}

export interface BackendChargingSession {
  session_id: string;
  user_id: string;
  vehicle_id: string;
  start_time: string;
  end_time?: string;
  start_soc: number;
  target_soc: number;
  final_soc?: number;
  energy_delivered_kwh: number;
  charging_duration_minutes: number;
  charging_power_kw: number;
  estimated_cost: number;
  renewable_energy_kwh: number;
  grid_energy_kwh: number;
  status: 'charging' | 'paused' | 'idle' | 'completed' | 'unplugged';
  charger_name?: string;
  location?: string;
}

export const chargingService = {
  async getPreferences(): Promise<BackendChargingPreferences> {
    return await apiClient.get<BackendChargingPreferences>('/api/charging/preferences');
  },

  async updatePreferences(
    updates: Partial<BackendChargingPreferences>
  ): Promise<BackendChargingPreferences> {
    return await apiClient.put<BackendChargingPreferences>('/api/charging/preferences', updates);
  },

  async getActiveSession(): Promise<BackendChargingSession | null> {
    return await apiClient.get<BackendChargingSession | null>('/api/charging/session/active');
  },

  async startSession(
    vehicleId: string = 'EV-001',
    chargerName: string = 'Home Level 2 Charger',
    targetSoc?: number
  ): Promise<BackendChargingSession> {
    return await apiClient.post<BackendChargingSession>('/api/charging/session/start', {
      vehicle_id: vehicleId,
      charger_name: chargerName,
      target_soc: targetSoc,
    });
  },

  async pauseSession(): Promise<BackendChargingSession> {
    return await apiClient.post<BackendChargingSession>('/api/charging/session/pause');
  },

  async resumeSession(): Promise<BackendChargingSession> {
    return await apiClient.post<BackendChargingSession>('/api/charging/session/resume');
  },

  async stopSession(): Promise<BackendChargingSession> {
    return await apiClient.post<BackendChargingSession>('/api/charging/session/stop');
  },

  async triggerChargeFaster(vehicleId: string = 'EV-001'): Promise<BackendChargingPreferences> {
    return await apiClient.post<BackendChargingPreferences>('/api/charging/charge-faster', {
      vehicle_id: vehicleId,
    });
  },
};
