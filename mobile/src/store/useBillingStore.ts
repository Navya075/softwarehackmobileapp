import { create } from 'zustand';
import { billingService, BackendBillItem } from '../services/billingService';
import { useNotificationStore } from './useNotificationStore';

const INITIAL_FALLBACK_BILLS: BackendBillItem[] = [
  {
    bill_id: 'bill_2026_09_19_pending',
    user_id: 'user_demo_01',
    vehicle_id: 'EV-001',
    session_id: 'sess_current',
    charger_name: 'Phoenix Mall (Charger C07)',
    energy_kwh: 18.2,
    energy_cost: 218.0,
    parking_cost: 30.0,
    service_fee: 10.0,
    total_cost: 258.0,
    currency: 'INR',
    status: 'pending',
    created_at: '2026-09-18T17:25:00Z',
    invoice_number: 'VF-INV-90214',
    duration: '55 mins',
    rate_per_kwh: 12.0,
    customer_name: 'Alex Mercer',
    vehicle_model: 'Tata Nexon EV Max',
    license_plate: 'KA-01-EV-2024',
    start_time: '04:30 PM',
    end_time: '05:25 PM',
    location: 'Phoenix Mall (Charger C07)',
  },
  {
    bill_id: 'bill_2026_09_18',
    user_id: 'user_demo_01',
    vehicle_id: 'EV-001',
    session_id: 'sess_1',
    charger_name: 'Home Level 2 (Green Residency)',
    energy_kwh: 18.2,
    energy_cost: 118.0,
    parking_cost: 0.0,
    service_fee: 0.0,
    total_cost: 118.0,
    currency: 'INR',
    status: 'paid',
    created_at: '2026-09-18T06:45:00Z',
    invoice_number: 'VF-INV-88210',
    payment_method: 'UPI (Demo)',
    paid_at: '2026-09-18T06:45:10Z',
    duration: '3h 42m',
    rate_per_kwh: 6.5,
    customer_name: 'Alex Mercer',
    vehicle_model: 'Tata Nexon EV Max',
    license_plate: 'KA-01-EV-2024',
    start_time: '03:00 AM',
    end_time: '06:42 AM',
    location: 'Home • Green Residency',
  },
  {
    bill_id: 'bill_2026_09_16',
    user_id: 'user_demo_01',
    vehicle_id: 'EV-001',
    session_id: 'sess_2',
    charger_name: 'Home Level 2 (Green Residency)',
    energy_kwh: 24.5,
    energy_cost: 142.0,
    parking_cost: 0.0,
    service_fee: 0.0,
    total_cost: 142.0,
    currency: 'INR',
    status: 'paid',
    created_at: '2026-09-16T07:15:00Z',
    invoice_number: 'VF-INV-87943',
    payment_method: 'Card (Demo)',
    paid_at: '2026-09-16T07:15:05Z',
    duration: '4h 10m',
    rate_per_kwh: 5.8,
    customer_name: 'Alex Mercer',
    vehicle_model: 'Tata Nexon EV Max',
    license_plate: 'KA-01-EV-2024',
    start_time: '03:05 AM',
    end_time: '07:15 AM',
    location: 'Home • Green Residency',
  },
  {
    bill_id: 'bill_2026_09_14',
    user_id: 'user_demo_01',
    vehicle_id: 'EV-001',
    session_id: 'sess_3',
    reservation_id: 'res_demo_14',
    charger_name: 'Phoenix Mall Fast Hub',
    energy_kwh: 15.0,
    energy_cost: 180.0,
    parking_cost: 30.0,
    service_fee: 15.0,
    total_cost: 225.0,
    currency: 'INR',
    status: 'paid',
    created_at: '2026-09-14T17:30:00Z',
    invoice_number: 'VF-INV-86512',
    payment_method: 'Wallet (Demo)',
    paid_at: '2026-09-14T17:30:12Z',
    duration: '35 mins',
    rate_per_kwh: 12.0,
    customer_name: 'Alex Mercer',
    vehicle_model: 'Tata Nexon EV Max',
    license_plate: 'KA-01-EV-2024',
    start_time: '04:55 PM',
    end_time: '05:30 PM',
    location: 'Phoenix Mall Fast Hub',
  },
];

interface BillingState {
  bills: BackendBillItem[];
  loading: boolean;
  fetchBills: () => Promise<void>;
  payBill: (billId: string, paymentMethod: string) => Promise<BackendBillItem | null>;
  getBill: (billId: string) => BackendBillItem | undefined;
  generateBillForSession: (sessionData: {
    id: string;
    date: string;
    energyKwh: number;
    duration: string;
    costInr: number;
    location: string;
  }) => BackendBillItem;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  bills: INITIAL_FALLBACK_BILLS,
  loading: false,

  fetchBills: async () => {
    set({ loading: true });
    try {
      const serverBills = await billingService.getInvoices();
      if (serverBills && serverBills.length > 0) {
        // Merge server bills with fallback bills so demo session is always available
        const existingIds = new Set(serverBills.map((b) => b.bill_id));
        const merged = [
          ...serverBills,
          ...get().bills.filter((b) => !existingIds.has(b.bill_id)),
        ];
        set({ bills: merged, loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      // Retain current bills on network/api error
      set({ loading: false });
    }
  },

  payBill: async (billId: string, paymentMethod: string) => {
    const nowIso = new Date().toISOString();
    let updatedBill: BackendBillItem | null = null;

    // Try paying via backend API first
    try {
      updatedBill = await billingService.payBill(billId, paymentMethod);
    } catch {
      // If offline/server unavailable, simulate locally
      const current = get().bills.find((b) => b.bill_id === billId);
      if (current) {
        updatedBill = {
          ...current,
          status: 'paid',
          paid_at: nowIso,
          payment_method: paymentMethod,
          invoice_number: current.invoice_number || `VF-INV-${billId.replace(/^bill_/, '').toUpperCase()}`,
        };
      }
    }

    if (updatedBill) {
      const finalBill = updatedBill;
      set((state) => ({
        bills: state.bills.map((b) => (b.bill_id === billId ? finalBill : b)),
      }));

      // Add a billing notification
      try {
        useNotificationStore.getState().addNotification({
          type: 'billing_event',
          severity: 'success',
          title: 'Demo Payment Successful',
          message: `Paid ₹${finalBill.total_cost} via ${paymentMethod}. Invoice #${finalBill.invoice_number || finalBill.bill_id} is now available.`,
          action_label: 'View Invoice',
        });
      } catch {
        // Non-critical
      }

      return finalBill;
    }

    return null;
  },

  getBill: (billId: string) => {
    return get().bills.find((b) => b.bill_id === billId);
  },

  generateBillForSession: (sessionData) => {
    const existing = get().bills.find((b) => b.session_id === sessionData.id || b.bill_id === sessionData.id);
    if (existing) {
      return existing;
    }

    const energyCost = Math.round(sessionData.costInr * 0.85);
    const serviceFee = sessionData.costInr - energyCost;
    const invNum = `VF-INV-${Math.floor(10000 + Math.random() * 90000)}`;

    const newBill: BackendBillItem = {
      bill_id: `bill_${sessionData.id}`,
      user_id: 'user_demo_01',
      vehicle_id: 'EV-001',
      session_id: sessionData.id,
      charger_name: sessionData.location,
      energy_kwh: sessionData.energyKwh,
      energy_cost: energyCost,
      parking_cost: 0,
      service_fee: serviceFee,
      total_cost: sessionData.costInr,
      currency: 'INR',
      status: 'paid',
      created_at: new Date().toISOString(),
      invoice_number: invNum,
      payment_method: 'UPI (Demo)',
      paid_at: new Date().toISOString(),
      duration: sessionData.duration,
      rate_per_kwh: Number((energyCost / (sessionData.energyKwh || 1)).toFixed(2)),
      customer_name: 'Alex Mercer',
      vehicle_model: 'Tata Nexon EV Max',
      license_plate: 'KA-01-EV-2024',
      location: sessionData.location,
    };

    set((state) => ({
      bills: [newBill, ...state.bills],
    }));

    return newBill;
  },
}));
