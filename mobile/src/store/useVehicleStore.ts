import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VehicleTelemetry, VehicleProfile } from '../types';
import { vehicleService } from '../services/vehicleService';

const VEHICLE_STORAGE_KEY = '@voltflow_active_vehicle';

async function safeStorageGet(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch (err) {
    console.warn(`[STORAGE] Failed to read "${key}" from AsyncStorage:`, err);
    return null;
  }
}

async function safeStorageSet(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[STORAGE] Failed to save "${key}" to AsyncStorage:`, err);
  }
}

interface VehicleState {
  activeVehicle: VehicleProfile;
  telemetry: VehicleTelemetry;
  smartPlanActive: boolean;
  emergencyBoostActive: boolean;
  fetchVehicles: () => Promise<void>;
  setTargetSoc: (soc: number) => void;
  setDepartureTime: (time: string) => void;
  toggleCharging: () => void;
  setEmergencyBoost: (active: boolean) => void;
  updateTelemetry: (partial: Partial<VehicleTelemetry>) => void;
  resetVehicleState: () => void;
}

const INITIAL_VEHICLE: VehicleProfile = {
  id: 'EV-001',
  vehicleType: 'car',
  make: 'Tesla',
  model: 'Model 3 Long Range',
  year: 2024,
  licensePlate: 'EV-001-LR',
  batteryCapacityKwh: 75.0,
  usableCapacityKwh: 71.2,
  batteryHealthScore: 94,
  connectorType: 'CCS2 / Type 2',
  maxAcPowerKw: 11.0,
  maxDcPowerKw: 170,
  targetSocDefault: 85,
  departureTimeDefault: 'Tomorrow, 7:30 AM',
};

const INITIAL_TELEMETRY: VehicleTelemetry = {
  vehicle_id: 'EV-001',
  vehicle_type: 'car',
  make: 'Tesla',
  model: 'Model 3 Long Range',
  current_soc: 48,
  target_soc: 85,
  battery_capacity_kwh: 75.0,
  usable_capacity_kwh: 71.2,
  battery_health_score: 94,
  charging_status: 'charging',
  plug_status: true,
  charging_power_kw: 3.2,
  max_charging_power_kw: 11.0,
  estimated_range_km: 156,
  voltage_v: 238,
  current_a: 13.5,
  departure_time: 'Tomorrow, 7:30 AM',
  session_start_time: '11:15 PM',
  energy_delivered_kwh: 12.8,
  estimated_completion_time: '6:42 AM',
  last_updated: 'Just now',
};

export const useVehicleStore = create<VehicleState>((set, get) => ({
  activeVehicle: INITIAL_VEHICLE,
  telemetry: INITIAL_TELEMETRY,
  smartPlanActive: true,
  emergencyBoostActive: false,

  fetchVehicles: async () => {
    const stored = await safeStorageGet(VEHICLE_STORAGE_KEY);
    if (stored) {
      try {
        const cached = JSON.parse(stored);
        set((state) => ({
          activeVehicle: cached,
          telemetry: {
            ...state.telemetry,
            make: cached.make || state.telemetry.make,
            model: cached.model || state.telemetry.model,
          },
        }));
      } catch {
        // ignore parse error
      }
    }

    try {
      const vehicles = await vehicleService.getVehicles();
      if (vehicles && vehicles.length > 0) {
        const v = vehicles[0];
        const newVehicle: VehicleProfile = {
          id: v.vehicle_id,
          vehicleType: (v.vehicle_type as any) || 'car',
          make: v.manufacturer,
          model: v.model,
          year: v.year,
          licensePlate: v.variant || 'EV-001-LR',
          batteryCapacityKwh: v.battery_capacity_kwh,
          usableCapacityKwh: v.usable_battery_capacity_kwh,
          batteryHealthScore: Math.round(v.battery_health_percent),
          connectorType: v.connector,
          maxAcPowerKw: v.max_charging_power_kw,
          maxDcPowerKw: 170,
          targetSocDefault: Math.round(v.target_soc),
          departureTimeDefault: 'Tomorrow, 7:30 AM',
        };

        set((state) => ({
          activeVehicle: newVehicle,
          telemetry: {
            ...state.telemetry,
            vehicle_id: v.vehicle_id,
            vehicle_type: (v.vehicle_type as any) || 'car',
            make: v.manufacturer,
            model: v.model,
            current_soc: Math.round(v.current_soc),
            target_soc: Math.round(v.target_soc),
            battery_capacity_kwh: v.battery_capacity_kwh,
            usable_capacity_kwh: v.usable_battery_capacity_kwh,
            battery_health_score: Math.round(v.battery_health_percent),
            estimated_range_km: Math.round(v.estimated_range_km),
            plug_status: v.plugged_in,
            charging_status: (v.charging_status as any) || 'charging',
          },
        }));

        await safeStorageSet(VEHICLE_STORAGE_KEY, JSON.stringify(newVehicle));
      }
    } catch {
      // offline fallback
    }
  },

  setTargetSoc: (soc: number) => {
    set((state) => ({
      telemetry: {
        ...state.telemetry,
        target_soc: soc,
        last_updated: 'Just now',
      },
    }));
  },

  setDepartureTime: (time: string) => {
    set((state) => ({
      telemetry: {
        ...state.telemetry,
        departure_time: time,
        last_updated: 'Just now',
      },
    }));
  },

  toggleCharging: () => {
    set((state) => {
      const isCharging = state.telemetry.charging_status === 'charging';
      return {
        telemetry: {
          ...state.telemetry,
          charging_status: isCharging ? 'paused' : 'charging',
          charging_power_kw: isCharging ? 0 : 3.2,
          last_updated: 'Just now',
        },
      };
    });
  },

  setEmergencyBoost: (active: boolean) => {
    set((state) => ({
      emergencyBoostActive: active,
      telemetry: {
        ...state.telemetry,
        charging_power_kw: active ? state.telemetry.max_charging_power_kw : 3.2,
        last_updated: 'Just now',
      },
    }));
  },

  updateTelemetry: (partial: Partial<VehicleTelemetry>) => {
    set((state) => ({
      telemetry: {
        ...state.telemetry,
        ...partial,
        last_updated: 'Just now',
      },
    }));
  },

  resetVehicleState: () => {
    set({
      activeVehicle: INITIAL_VEHICLE,
      telemetry: INITIAL_TELEMETRY,
      smartPlanActive: true,
      emergencyBoostActive: false,
    });
  },
}));
