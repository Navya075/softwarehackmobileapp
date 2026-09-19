export type ChargingStatus = 'charging' | 'paused' | 'idle' | 'completed' | 'unplugged';

export interface VehicleTelemetry {
  vehicle_id: string;
  vehicle_type?: 'car' | 'scooter' | 'motorcycle';
  make: string;
  model: string;
  current_soc: number;
  target_soc: number;
  battery_capacity_kwh: number;
  charging_status: ChargingStatus;
  plug_status: boolean;
  charging_power_kw: number;
  max_charging_power_kw: number;
  estimated_range_km: number;
  voltage_v: number;
  current_a: number;
  departure_time: string;
  session_start_time: string;
  energy_delivered_kwh: number;
  estimated_completion_time: string;
  last_updated: string;
  battery_health_score?: number;
  usable_capacity_kwh?: number;
}

export interface BuildingGridState {
  base_load_kw: number;
  grid_limit_kw: number;
  current_ev_load_kw: number;
  total_demand_kw: number;
  curtailment_active: boolean;
  current_tariff_rate: number;
  solar_generation_kw: number;
}

export interface OptimizationDecision {
  recommended_power_kw: number;
  departure_guaranteed: boolean;
  departure_risk: boolean;
  reason_codes: string[];
  explanation_summary: string;
  reasons: string[];
  renewable_percentage: number;
  estimated_cost_inr: number;
}

export type NotificationSeverity = 'info' | 'warning' | 'success' | 'urgent';

export type NotificationEventType =
  | 'charging_start'
  | 'charging_paused'
  | 'charging_resumed'
  | 'charging_completed'
  | 'charging_interrupted'
  | 'target_reached'
  | 'plug_event'
  | 'unplug_event'
  | 'departure_risk'
  | 'departure_guaranteed'
  | 'charging_slowed'
  | 'charging_restored'
  | 'solar_opportunity'
  | 'charger_event'
  | 'billing_event'
  | 'optimization_curtailment'
  | 'optimization_restored'
  | 'alert';

export interface NotificationItem {
  id: string;
  timestamp: string;
  type: NotificationEventType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  read: boolean;
  action_label?: string;
  metadata?: Record<string, any>;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  address?: string;
  buildingName?: string;
  unitNumber?: string;
  locality?: string;
  city?: string;
  pincode?: string;
  hasHomeCharger?: boolean;
  propertyType: 'residential' | 'commercial';
  costPriority: 'eco' | 'balanced' | 'fast';
  completedOnboarding: boolean;
}

export interface VehicleProfile {
  id: string;
  vehicleType?: 'car' | 'scooter' | 'motorcycle';
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  batteryCapacityKwh: number;
  batteryHealthScore?: number;
  usableCapacityKwh?: number;
  connectorType: string;
  maxAcPowerKw: number;
  maxDcPowerKw: number;
  targetSocDefault: number;
  departureTimeDefault: string;
}

export interface ChargingPreferences {
  userId: string;
  targetSoc: number;
  departureTime: string;
  strategy: 'eco' | 'balanced' | 'speed';
  emergencyMode: boolean;
  solarSurplusSync: boolean;
}
