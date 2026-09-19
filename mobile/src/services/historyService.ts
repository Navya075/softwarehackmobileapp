import { apiClient } from './apiClient';
import { BackendChargingSession } from './chargingService';

export const historyService = {
  async getHistory(dateFilter?: string): Promise<BackendChargingSession[]> {
    const qs = dateFilter ? `?date=${encodeURIComponent(dateFilter)}` : '';
    return await apiClient.get<BackendChargingSession[]>(`/api/history${qs}`);
  },

  async getSession(sessionId: string): Promise<BackendChargingSession> {
    return await apiClient.get<BackendChargingSession>(`/api/history/${sessionId}`);
  },
};
