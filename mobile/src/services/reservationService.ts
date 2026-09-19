import { apiClient } from './apiClient';

export interface BackendReservation {
  reservation_id: string;
  user_id: string;
  vehicle_id: string;
  charger_id: string;
  charger_name: string;
  location: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'active' | 'completed' | 'cancelled' | 'expired';
  estimated_energy_kwh: number;
  estimated_charging_cost: number;
  parking_cost: number;
  service_fee: number;
  total_estimated_cost: number;
  created_at: string;
}

export interface CreateReservationParams {
  charger_id: string;
  vehicle_id: string;
  date: string;
  time_slot: string;
  estimated_kwh?: number;
}

export const reservationService = {
  async getReservations(): Promise<BackendReservation[]> {
    return await apiClient.get<BackendReservation[]>('/api/reservations');
  },

  async createReservation(params: CreateReservationParams): Promise<BackendReservation> {
    return await apiClient.post<BackendReservation>('/api/reservations', params);
  },

  async cancelReservation(reservationId: string): Promise<BackendReservation> {
    return await apiClient.post<BackendReservation>(`/api/reservations/${reservationId}/cancel`);
  },
};
