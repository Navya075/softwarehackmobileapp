import { VehicleProfile, VehicleTelemetry, NotificationItem } from '../types';

export const mockVehicle: VehicleProfile = {
  id: 'ev_001',
  make: 'Tata',
  model: 'Nexon EV Long Range',
  year: 2024,
  licensePlate: 'TS-09-EV-2026',
  batteryCapacityKwh: 40.5,
  usableCapacityKwh: 38.1,
  batteryHealthScore: 94,
  connectorType: 'CCS2 / Type 2',
  maxAcPowerKw: 7.2,
  maxDcPowerKw: 50,
  targetSocDefault: 85,
  departureTimeDefault: 'Tomorrow, 7:30 AM',
};

export const mockChargingSession = {
  currentSoc: 48,
  targetSoc: 85,
  currentPowerKw: 3.2,
  energyDeliveredKwh: 12.8,
  timeRemainingMinutes: 142,
  readyByTime: '6:42 AM',
  departureTime: '7:30 AM',
  renewablePercentage: 68,
  estimatedCostInr: 74,
  durationFormatted: '2h 15m',
  voltageV: 238,
  currentA: 13.5,
  status: 'charging' as const,
  chargerName: 'Home Level 2 Charger',
  location: 'Green Residency',
  solarContributionKw: 2.2,
  gridContributionKw: 1.0,
};

export interface PlanStep {
  time: string;
  powerKw: number;
  label: string;
  isCurrent?: boolean;
  isPaused?: boolean;
  isTarget?: boolean;
}

export const mockChargingPlan: {
  steps: PlanStep[];
  whyThisPlan: string[];
  departureGuaranteed: boolean;
  readyBy: string;
  bufferMinutes: number;
} = {
  departureGuaranteed: true,
  readyBy: '6:42 AM',
  bufferMinutes: 48,
  steps: [
    { time: 'NOW', powerKw: 3.2, label: 'Charging at balanced rate', isCurrent: true },
    { time: '6:00 PM', powerKw: 3.0, label: 'Early evening power limit' },
    { time: '8:00 PM', powerKw: 1.5, label: 'Slowing down during building peak' },
    { time: '10:00 PM', powerKw: 0.0, label: 'Charging paused during peak demand', isPaused: true },
    { time: '2:00 AM', powerKw: 4.0, label: 'Resuming during cheaper off-peak hours' },
    { time: '5:00 AM', powerKw: 6.0, label: 'Ramping power for departure buffer' },
    { time: '6:42 AM', powerKw: 0.0, label: '85% Target reached successfully', isTarget: true },
  ],
  whyThisPlan: [
    'Building electricity demand is currently higher.',
    'Electricity is expected to be cheaper later tonight.',
    'More clean solar energy is prioritized.',
    'Your EV is fully guaranteed to be ready before you leave.',
  ],
};

export interface ChargerItem {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  availableCount: number;
  totalCount: number;
  speedType: 'DC Fast' | 'Level 2 AC' | 'Ultra Fast';
  powerKw: number;
  pricePerKwh: number;
  parkingPricePerHour?: number;
  connector: string;
  estimatedChargingMin: number;
  isSolarPowered: boolean;
  context: 'residential' | 'commercial';
  currentOccupied?: boolean;
}

export const mockChargers: ChargerItem[] = [
  {
    id: 'ch_phoenix_07',
    name: 'Phoenix Mall',
    location: 'B2 Parking, Slot C07',
    distanceKm: 1.2,
    availableCount: 3,
    totalCount: 8,
    speedType: 'DC Fast',
    powerKw: 120,
    pricePerKwh: 12,
    parkingPricePerHour: 30,
    connector: 'CCS2',
    estimatedChargingMin: 35,
    isSolarPowered: true,
    context: 'commercial',
  },
  {
    id: 'ch_green_res_01',
    name: 'Green Residency Community',
    location: 'Tower 4 Basement (C01)',
    distanceKm: 0.1,
    availableCount: 2,
    totalCount: 3,
    speedType: 'Level 2 AC',
    powerKw: 11,
    pricePerKwh: 4.5,
    parkingPricePerHour: 0,
    connector: 'Type 2',
    estimatedChargingMin: 180,
    isSolarPowered: true,
    context: 'residential',
  },
  {
    id: 'ch_cyber_towers',
    name: 'Cyber Towers Workplace Hub',
    location: 'Gate 3 Visitor Parking',
    distanceKm: 2.8,
    availableCount: 5,
    totalCount: 10,
    speedType: 'DC Fast',
    powerKw: 60,
    pricePerKwh: 10,
    parkingPricePerHour: 20,
    connector: 'CCS2',
    estimatedChargingMin: 45,
    isSolarPowered: false,
    context: 'commercial',
  },
  {
    id: 'ch_city_center',
    name: 'City Center Metro Station',
    location: 'P1 South Concourse',
    distanceKm: 4.5,
    availableCount: 0, // Fully occupied for Smart Queue demo!
    totalCount: 4,
    speedType: 'Ultra Fast',
    powerKw: 150,
    pricePerKwh: 14,
    parkingPricePerHour: 40,
    connector: 'CCS2',
    estimatedChargingMin: 25,
    isSolarPowered: true,
    context: 'commercial',
    currentOccupied: true,
  },
];

export interface ReservationItem {
  id: string;
  chargerId: string;
  chargerName: string;
  slotNumber: string;
  location: string;
  date: string;
  timeSlot: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  estimatedCost: number;
}

export const mockReservations: ReservationItem[] = [
  {
    id: 'res_001',
    chargerId: 'ch_phoenix_07',
    chargerName: 'Phoenix Mall',
    slotNumber: 'Charger C07',
    location: 'B2 Parking, Slot C07',
    date: 'Today',
    timeSlot: '4:30 PM – 5:30 PM',
    status: 'Confirmed',
    estimatedCost: 196,
  },
  {
    id: 'res_002',
    chargerId: 'ch_green_res_01',
    chargerName: 'Green Residency',
    slotNumber: 'Charger C01',
    location: 'Tower 4 Basement',
    date: 'Yesterday',
    timeSlot: '6:00 PM – 8:00 PM',
    status: 'Completed',
    estimatedCost: 74,
  },
];

export const mockBilling = {
  currentSession: {
    energyKwh: 18.2,
    energyCost: 218,
    parkingFee: 30,
    serviceFee: 10,
    total: 258,
    date: 'Sep 18, 2026',
    time: '4:30 PM - 5:25 PM',
    location: 'Phoenix Mall (Charger C07)',
  },
  monthlyResidential: {
    month: 'September 2026',
    totalSessions: 22,
    totalKwh: 182,
    averageCostPerKwh: 4.8,
    totalAmount: 874,
    solarSavings: 380,
    status: 'Paid automatically',
  },
};

export interface HistorySessionItem {
  id: string;
  date: string;
  energyKwh: number;
  startSoc: number;
  endSoc: number;
  duration: string;
  solarSharePercent: number;
  costInr: number;
  location: string;
  speed: string;
  reasonSummary?: string;
}

export const mockHistory: HistorySessionItem[] = [
  {
    id: 'hist_1',
    date: 'Sep 18, 2026',
    energyKwh: 18.2,
    startSoc: 34,
    endSoc: 82,
    duration: '3h 42m',
    solarSharePercent: 64,
    costInr: 118,
    location: 'Home • Green Residency',
    speed: 'Level 2 AC (3.2 kW - 6.6 kW)',
    reasonSummary: 'Power adjusted during 8-10 PM building peak, keeping your vehicle on track.',
  },
  {
    id: 'hist_2',
    date: 'Sep 16, 2026',
    energyKwh: 24.5,
    startSoc: 22,
    endSoc: 85,
    duration: '4h 10m',
    solarSharePercent: 72,
    costInr: 142,
    location: 'Home • Green Residency',
    speed: 'Level 2 AC (4.0 kW)',
    reasonSummary: 'Overnight off-peak window used for maximum savings.',
  },
  {
    id: 'hist_3',
    date: 'Sep 14, 2026',
    energyKwh: 15.0,
    startSoc: 50,
    endSoc: 80,
    duration: '32m',
    solarSharePercent: 40,
    costInr: 180,
    location: 'Phoenix Mall Fast Hub',
    speed: 'DC Fast (60 kW)',
    reasonSummary: 'Quick commercial top-up while shopping.',
  },
];

export const mockCarbon = {
  month: 'September',
  totalKwh: 182,
  renewableKwh: 116,
  gridKwh: 66,
  renewableSharePercent: 64,
  co2AvoidedKg: 142,
  treesEquivalent: 7,
  gasolineSavedLitres: 61,
};

export const mockReports = {
  month: 'September 2026',
  totalSessions: 22,
  energyConsumedKwh: 182,
  totalCostInr: 874,
  avgChargingDuration: '3.2 hours',
  renewableKwh: 116,
  gridKwh: 66,
  renewableSharePercent: 64,
  co2ImpactKg: 142,
  departureReadinessPercent: 100, // 100% of departures on time
  chargeFasterSessions: 2,
};

export const mockBatteryInsights = {
  healthScore: 94,
  healthStatus: 'Good',
  usableCapacityKwh: 38.1,
  originalCapacityKwh: 40.5,
  degradationPercent: 6,
  cellCondition: 'Healthy (Uniform Voltage)',
  operatingTemperatureC: 28.4,
  cycleCount: 84,
  estimatedLifeRemainingYears: 7.5,
  averageChargingRange: '42% → 81%',
  averageSessionDuration: '3.1 hours',
  fastChargingShare: '12%',
  normalChargingShare: '88%',
  recommendations: [
    'Most of your charging sessions are slower overnight sessions, which is ideal for battery longevity.',
    'Keeping your daily target at 80%–85% preserves battery health for years.',
    'Only charge to 100% when preparing for long highway trips.',
  ],
};

export const mockTrips = {
  fromCity: 'Hyderabad',
  toCity: 'Vijayawada',
  distanceKm: 275,
  currentRangeKm: 180,
  needsExtraCharging: true,
  recommendedTargetSoc: 92,
  requiredKwh: 16.5,
  estimatedChargingTimeMin: 22,
};

export const mockSmartInsights = {
  chargingPrediction: '85% by 6:42 AM',
  estimatedCostRange: '₹72 – ₹81',
  estimatedRange: '~275 km',
  solarOpportunity: 'High tomorrow, 11 AM – 2 PM',
  electricityDemandWindow: 'Higher 6:30 – 9 PM',
  departureStatus: 'On track',
};

export const mockResidentialCommunity = {
  communityName: 'Green Residency',
  buildingElectricityUseKw: 61,
  evChargingKw: 23,
  solarGenerationKw: 18,
  gridStatus: 'Normal',
  explanation: 'Your charging may slow down when the building is using more electricity.',
};

export const mockCommercialEnergy = {
  facilityName: 'Phoenix Mall',
  chargingStatus: 'Available',
  solarLevel: 'High',
  electricityDemand: 'Normal',
  currentChargingPrice: '₹12 / kWh',
};
