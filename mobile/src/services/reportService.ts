import { apiClient } from './apiClient';

export interface BackendMonthlyReport {
  month: string;
  year: number;
  total_sessions: number;
  total_energy_kwh: number;
  total_cost: number;
  average_session_duration: string;
  renewable_energy_kwh: number;
  grid_energy_kwh: number;
  renewable_share_percent: number;
  departure_readiness_percent: number;
  charge_faster_sessions: number;
}

export interface BackendCarbonReport {
  month: string;
  year: number;
  total_kwh: number;
  renewable_kwh: number;
  grid_kwh: number;
  renewable_share_percent: number;
  co2_avoided_kg: number;
  trees_equivalent: number;
  gasoline_saved_litres: number;
}

export const reportService = {
  async getMonthlyReport(
    month: string = 'September',
    year: number = 2026
  ): Promise<BackendMonthlyReport> {
    return await apiClient.get<BackendMonthlyReport>(`/api/reports/monthly?month=${month}&year=${year}`);
  },

  async getCarbonReport(
    month: string = 'September',
    year: number = 2026
  ): Promise<BackendCarbonReport> {
    return await apiClient.get<BackendCarbonReport>(`/api/reports/carbon?month=${month}&year=${year}`);
  },
};
