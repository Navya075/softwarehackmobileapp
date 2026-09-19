import { create } from 'zustand';
import { BuildingGridState, OptimizationDecision } from '../types';

interface EnergyState {
  gridState: BuildingGridState;
  decision: OptimizationDecision;
  updateGridState: (partial: Partial<BuildingGridState>) => void;
  updateDecision: (partial: Partial<OptimizationDecision>) => void;
}

const INITIAL_GRID_STATE: BuildingGridState = {
  base_load_kw: 61,
  grid_limit_kw: 100,
  current_ev_load_kw: 39,
  total_demand_kw: 100,
  curtailment_active: false,
  current_tariff_rate: 6.5,
  solar_generation_kw: 18,
};

const INITIAL_DECISION: OptimizationDecision = {
  recommended_power_kw: 3.2,
  departure_guaranteed: true,
  departure_risk: false,
  reason_codes: ['TARGET_STILL_GUARANTEED', 'SOLAR_OPPORTUNITY', 'HIGH_BUILDING_DEMAND'],
  explanation_summary: 'Charging modulated to 3.2 kW to respect building peak demand while ensuring 85% departure target by 7:30 AM.',
  reasons: [
    'Building base load is 61 kW (close to 100 kW transformer threshold)',
    '18 kW rooftop solar generation utilized directly for zero-carbon charging',
    'Departure target is fully guaranteed to complete by 6:42 AM',
  ],
  renewable_percentage: 68,
  estimated_cost_inr: 74,
};

export const useEnergyStore = create<EnergyState>((set) => ({
  gridState: INITIAL_GRID_STATE,
  decision: INITIAL_DECISION,

  updateGridState: (partial: Partial<BuildingGridState>) => {
    set((state) => {
      const updated = { ...state.gridState, ...partial };
      updated.total_demand_kw = updated.base_load_kw + updated.current_ev_load_kw;
      return { gridState: updated };
    });
  },

  updateDecision: (partial: Partial<OptimizationDecision>) => {
    set((state) => ({
      decision: { ...state.decision, ...partial },
    }));
  },
}));
