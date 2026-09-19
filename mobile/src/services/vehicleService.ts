import { apiClient } from './apiClient';

export interface BackendVehicle {
  vehicle_id: string;
  user_id: string;
  vehicle_type?: string;
  manufacturer: string;
  model: string;
  variant?: string;
  year: number;
  battery_capacity_kwh: number;
  usable_battery_capacity_kwh: number;
  battery_health_percent: number;
  current_soc: number;
  target_soc: number;
  max_charging_power_kw: number;
  connector: string;
  estimated_range_km: number;
  plugged_in: boolean;
  charging_status: string;
}

export interface BatteryHealthInfo {
  battery_health_percent: number;
  usable_capacity_kwh: number;
  original_capacity_kwh: number;
  degradation_percent: number;
  cell_condition: string;
  operating_temperature_c: number;
  cycle_count: number;
  last_health_update: string;
}

export const vehicleService = {
  async getVehicles(): Promise<BackendVehicle[]> {
    return await apiClient.get<BackendVehicle[]>('/api/vehicles');
  },

  async getVehicle(vehicleId: string): Promise<BackendVehicle> {
    return await apiClient.get<BackendVehicle>(`/api/vehicles/${vehicleId}`);
  },

  async getBatteryHealth(vehicleId: string): Promise<BatteryHealthInfo> {
    return await apiClient.get<BatteryHealthInfo>(`/api/vehicles/${vehicleId}/battery-health`);
  },

  async updateVehicle(vehicleId: string, updates: Partial<BackendVehicle>): Promise<BackendVehicle> {
    return await apiClient.put<BackendVehicle>(`/api/vehicles/${vehicleId}`, updates);
  },

  async createVehicle(vehicle: {
    vehicle_type?: string;
    manufacturer: string;
    model: string;
    variant?: string;
    year?: number;
    battery_capacity_kwh?: number;
    usable_battery_capacity_kwh?: number;
    battery_health_percent?: number;
    max_charging_power_kw?: number;
    connector?: string;
  }): Promise<BackendVehicle> {
    return await apiClient.post<BackendVehicle>('/api/vehicles', vehicle);
  },
};
