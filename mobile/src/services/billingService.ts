import { apiClient } from './apiClient';

export interface BackendBillItem {
  bill_id: string;
  user_id: string;
  vehicle_id: string;
  session_id?: string;
  reservation_id?: string;
  charger_name: string;
  energy_kwh: number;
  energy_cost: number;
  parking_cost: number;
  service_fee: number;
  total_cost: number;
  currency: string;
  status: string; // 'paid' | 'pending'
  created_at: string;
  invoice_number?: string;
  payment_method?: string;
  paid_at?: string;
  duration?: string;
  rate_per_kwh?: number;
  customer_name?: string;
  vehicle_model?: string;
  license_plate?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
}

export interface BackendBillingSummary {
  total_spent: number;
  total_sessions: number;
  current_month_total: number;
  currency: string;
  bills: BackendBillItem[];
}

export const billingService = {
  async getSummary(): Promise<BackendBillingSummary> {
    return await apiClient.get<BackendBillingSummary>('/api/billing/summary');
  },

  async getInvoices(): Promise<BackendBillItem[]> {
    return await apiClient.get<BackendBillItem[]>('/api/billing/invoices');
  },

  async getInvoice(billId: string): Promise<BackendBillItem> {
    return await apiClient.get<BackendBillItem>(`/api/billing/invoices/${billId}`);
  },

  async payBill(billId: string, paymentMethod: string = 'UPI (Demo)'): Promise<BackendBillItem> {
    return await apiClient.post<BackendBillItem>(`/api/billing/pay/${billId}`, {
      payment_method: paymentMethod,
    });
  },
};
