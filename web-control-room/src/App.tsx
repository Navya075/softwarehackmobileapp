import { useState, useEffect } from 'react';
import {
  Gauge,
  Building2,
  Sun,
  RotateCcw,
  Play,
  Pause,
  PlugZap,
  Sliders,
  Radio,
  Activity,
  CheckCircle2,
  Flame,
} from 'lucide-react';

interface VehicleSim {
  id: string;
  name: string;
  capacityKwh: number;
  maxPowerKw: number;
  soc: number;
  targetSoc: number;
  departure: string;
  plugged: boolean;
  charging: boolean;
  powerKw: number;
  rangeKm: number;
}

const FLEET_PRESETS: VehicleSim[] = [
  {
    id: 'EV-001',
    name: 'Tesla Model 3',
    capacityKwh: 75,
    maxPowerKw: 11,
    soc: 48,
    targetSoc: 85,
    departure: '07:30 AM',
    plugged: true,
    charging: true,
    powerKw: 3.2,
    rangeKm: 156,
  },
  {
    id: 'EV-002',
    name: 'Hyundai Ioniq 5',
    capacityKwh: 77.4,
    maxPowerKw: 22,
    soc: 62,
    targetSoc: 90,
    departure: '08:15 AM',
    plugged: true,
    charging: true,
    powerKw: 7.4,
    rangeKm: 245,
  },
  {
    id: 'EV-003',
    name: 'Nissan Leaf',
    capacityKwh: 40,
    maxPowerKw: 6.6,
    soc: 35,
    targetSoc: 80,
    departure: '06:45 AM',
    plugged: true,
    charging: false,
    powerKw: 0,
    rangeKm: 98,
  },
];

export default function App() {
  const [activeVehicleId, setActiveVehicleId] = useState('EV-001');
  const [vehicles, setVehicles] = useState<VehicleSim[]>(FLEET_PRESETS);
  const [buildingBaseLoad, setBuildingBaseLoad] = useState(61);
  const [gridLimit, setGridLimit] = useState(100);
  const [solarKw, setSolarKw] = useState(18);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [peakSimulationActive, setPeakSimulationActive] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [demoLog, setDemoLog] = useState<string[]>([
    'System initialized. Common Vehicle Data Layer listening.',
    'EV-001 connected. Telemetry synchronized.',
  ]);

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];
  const totalFleetEvLoad = vehicles.reduce((sum, v) => sum + (v.charging ? v.powerKw : 0), 0);
  const totalDemand = buildingBaseLoad + totalFleetEvLoad;
  const isOverLimit = totalDemand > gridLimit;

  // Add demo log
  const logMessage = (msg: string) => {
    setDemoLog((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 15),
    ]);
  };

  const sendBackend = async (path: string, body?: any) => {
    try {
      await fetch(`http://localhost:8000/api/simulator/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      // Standalone mode when backend is offline
    }
  };

  // Live WebSocket synchronization with FastAPI Backend
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      try {
        ws = new WebSocket('ws://localhost:8000/ws/live?user_id=control_room');
        ws.onopen = () => {
          setBackendConnected(true);
          logMessage('Connected to live FastAPI backend WebSocket (/ws/live)');
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'telemetry_snapshot' || data.type === 'telemetry_update') {
              const tel = data.data;
              if (tel && tel.vehicle_id) {
                setVehicles((prev) =>
                  prev.map((v) =>
                    v.id === tel.vehicle_id
                      ? {
                          ...v,
                          soc: Math.round(tel.current_soc),
                          targetSoc: Math.round(tel.target_soc),
                          charging: tel.charging_status === 'charging',
                          plugged: tel.plug_status,
                          powerKw: tel.charging_power_kw,
                          rangeKm: Math.round(tel.estimated_range_km),
                        }
                      : v
                  )
                );
              }
            } else if (data.type === 'grid_state_change') {
              const g = data.data;
              if (g.building_load_kw !== undefined) setBuildingBaseLoad(g.building_load_kw);
              if (g.solar_generation_kw !== undefined) setSolarKw(g.solar_generation_kw);
              if (g.grid_limit_kw !== undefined) setGridLimit(g.grid_limit_kw);
            }
          } catch {
            // non-json or ping
          }
        };
        ws.onclose = () => {
          setBackendConnected(false);
          reconnectTimeout = setTimeout(connectWs, 4000);
        };
        ws.onerror = () => {
          setBackendConnected(false);
        };
      } catch {
        setBackendConnected(false);
      }
    };

    connectWs();
    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // Simulate Peak Grid Demand scenario
  const handleSimulatePeakDemand = () => {
    setPeakSimulationActive(true);
    setBuildingBaseLoad(88); // Building surges
    sendBackend('grid', { building_load_kw: 88 });
    logMessage('⚠️ SIMULATE PEAK GRID DEMAND triggered: Building load spiked to 88 kW');

    setTimeout(() => {
      logMessage('⚡ Total demand (88 kW + EV load) exceeds 100 kW grid threshold!');
      logMessage('🛡️ Optimization Engine activated Dynamic Load Balancing: Throttling EV fleet');
      // Curtail EV power
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === 'EV-001'
            ? { ...v, powerKw: 2.0 }
            : v.id === 'EV-002'
            ? { ...v, powerKw: 3.5 }
            : v
        )
      );
      sendBackend('power', { vehicle_id: 'EV-001', power_kw: 2.0 });
      sendBackend('power', { vehicle_id: 'EV-002', power_kw: 3.5 });
      logMessage('📉 EV-001 charging power curtailed to 2.0 kW (Departure still guaranteed by 6:42 AM)');
      logMessage('📱 WebSocket push broadcasted: Instant in-app alert sent to EV Owner');
    }, 800);
  };

  // Reset Demo
  const handleResetDemo = () => {
    setPeakSimulationActive(false);
    setBuildingBaseLoad(61);
    setGridLimit(100);
    setSolarKw(18);
    setSimSpeed(1);
    setVehicles(FLEET_PRESETS);
    sendBackend('reset');
    logMessage('🔄 Demo environment reset to baseline state.');
  };

  // Toggle active vehicle plug
  const togglePlug = () => {
    const nextPlugged = !activeVehicle.plugged;
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === activeVehicle.id
          ? { ...v, plugged: nextPlugged, charging: !nextPlugged ? false : v.charging }
          : v
      )
    );
    sendBackend(nextPlugged ? 'plug' : 'unplug', { vehicle_id: activeVehicle.id });
    logMessage(`${activeVehicle.id} ${nextPlugged ? 'Plugged in' : 'Unplugged'}`);
  };

  // Toggle active vehicle charging
  const toggleCharging = () => {
    const nextCharging = !activeVehicle.charging;
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === activeVehicle.id
          ? { ...v, charging: nextCharging, powerKw: nextCharging ? 3.2 : 0 }
          : v
      )
    );
    sendBackend(nextCharging ? 'resume' : 'pause', { vehicle_id: activeVehicle.id });
    logMessage(
      `${activeVehicle.id} charging ${nextCharging ? 'Started' : 'Paused'}`
    );
  };

  return (
    <div className="min-h-screen bg-[#080C10] text-slate-100 p-4 lg:p-8 font-sans">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              Judge & Operator View
            </span>
            <span
              className={`border text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                backendConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {backendConnected ? 'Live Backend Connected' : 'Standalone Sim'}
            </span>
            <span className="text-slate-500 text-xs font-mono">FastAPI • WebSockets • VDL</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-1 text-white">
            Hackathon Fleet & Grid Control Room
          </h1>
          <p className="text-slate-400 text-xs lg:text-sm mt-0.5">
            Real-time vehicle telemetry simulator, building demand peak shaving, and live optimizer engine.
          </p>
        </div>

        {/* Action buttons: Simulate Peak & Reset */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleSimulatePeakDemand}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
              peakSimulationActive
                ? 'bg-amber-500 text-black shadow-amber-500/25 ring-2 ring-amber-400'
                : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-900/30'
            }`}
          >
            <Flame className="w-4 h-4" />
            SIMULATE PEAK GRID DEMAND
          </button>

          <button
            onClick={handleResetDemo}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold transition"
          >
            <RotateCcw className="w-4 h-4" />
            RESET DEMO
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Building, Solar & Grid Simulator (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          {/* Building Demand & Transformer Card */}
          <div className="bg-[#111620] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-400" />
                <h2 className="font-bold text-white text-base">Building Energy & Transformer Cap</h2>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  isOverLimit
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {isOverLimit ? 'GRID EXCEEDED' : 'DEMAND BALANCED'}
              </span>
            </div>

            {/* Total Demand Visual Meter */}
            <div className="space-y-2 mb-6 bg-[#0B0F14] p-4 rounded-xl border border-slate-800/80">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total Building Demand</span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-black ${isOverLimit ? 'text-red-400' : 'text-white'}`}>
                    {totalDemand.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400">/ {gridLimit} kW</span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${Math.min((buildingBaseLoad / gridLimit) * 100, 100)}%` }}
                  className="bg-sky-500 transition-all duration-300"
                  title={`Base Load: ${buildingBaseLoad} kW`}
                />
                <div
                  style={{ width: `${Math.min((totalFleetEvLoad / gridLimit) * 100, 100)}%` }}
                  className="bg-emerald-500 transition-all duration-300"
                  title={`EV Fleet Load: ${totalFleetEvLoad.toFixed(1)} kW`}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Base Load ({buildingBaseLoad} kW)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> EV Fleet ({totalFleetEvLoad.toFixed(1)} kW)
                </span>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">Building Base Load</span>
                  <span className="text-sky-400 font-mono font-bold">{buildingBaseLoad} kW</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="120"
                  value={buildingBaseLoad}
                  onChange={(e) => setBuildingBaseLoad(Number(e.target.value))}
                  className="w-full accent-sky-500 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">Grid Transformer Limit</span>
                  <span className="text-amber-400 font-mono font-bold">{gridLimit} kW</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={gridLimit}
                  onChange={(e) => setGridLimit(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-400" /> Rooftop Solar Generation
                  </span>
                  <span className="text-amber-400 font-mono font-bold">{solarKw} kW</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={solarKw}
                  onChange={(e) => setSolarKw(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Simulation Physics & Speed Engine */}
          <div className="bg-[#111620] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-white text-base">Physics Simulator Speed</h2>
              </div>
              <span className="text-xs bg-slate-800 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono font-bold">
                {simSpeed}x Demo Clock
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Accelerate time so judges can watch battery SOC increase from 48% to 85% in seconds.
            </p>

            <div className="grid grid-cols-6 gap-2">
              {[1, 5, 15, 30, 60, 120].map((spd) => (
                <button
                  key={spd}
                  onClick={() => {
                    setSimSpeed(spd);
                    logMessage(`Simulation speed set to ${spd}x`);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold font-mono transition border ${
                    simSpeed === spd
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Live Simulator Event Logs */}
          <div className="bg-[#111620] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-sky-400" />
              <h2 className="font-bold text-white text-sm">Real-Time Event Stream</h2>
            </div>
            <div className="bg-[#0B0F14] rounded-xl p-3 border border-slate-800/80 max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px]">
              {demoLog.map((log, index) => (
                <p
                  key={index}
                  className={
                    log.includes('⚠️') || log.includes('exceeds')
                      ? 'text-amber-400'
                      : log.includes('🛡️') || log.includes('curtailed')
                      ? 'text-emerald-400'
                      : 'text-slate-400'
                  }
                >
                  {log}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Fleet Telemetry & Active Vehicle Manipulation (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          {/* Vehicle Fleet Selector */}
          <div className="bg-[#111620] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-white text-base">Virtual Vehicle Fleet</h2>
                <p className="text-xs text-slate-400">Select an EV to inspect telemetry and manipulate state</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">3 Vehicles Active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {vehicles.map((v) => {
                const isSelected = v.id === activeVehicleId;
                return (
                  <button
                    key={v.id}
                    onClick={() => setActiveVehicleId(v.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/40 shadow-lg'
                        : 'bg-[#0B0F14] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-xs font-bold font-mono text-emerald-400">{v.id}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          v.charging ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {v.charging ? `${v.powerKw} kW` : 'Idle'}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-white truncate">{v.name}</div>
                    <div className="text-xs text-slate-400 mt-1 flex justify-between">
                      <span>SOC: {v.soc}%</span>
                      <span>Target: {v.targetSoc}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Vehicle Live Telemetry & Direct Override Controls */}
          <div className="bg-[#111620] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg text-white">{activeVehicle.name}</h2>
                  <span className="bg-slate-800 text-slate-300 text-xs font-mono px-2 py-0.5 rounded">
                    {activeVehicle.id}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Capacity: {activeVehicle.capacityKwh} kWh • Max: {activeVehicle.maxPowerKw} kW • Departure:{' '}
                  {activeVehicle.departure}
                </p>
              </div>

              {/* Hardware Toggles */}
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlug}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
                    activeVehicle.plugged
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <PlugZap className="w-3.5 h-3.5" />
                  {activeVehicle.plugged ? 'Plugged' : 'Unplugged'}
                </button>

                <button
                  onClick={toggleCharging}
                  disabled={!activeVehicle.plugged}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
                    activeVehicle.charging
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {activeVehicle.charging ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {activeVehicle.charging ? 'Charging' : 'Paused'}
                </button>
              </div>
            </div>

            {/* Telemetry Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-[#0B0F14] border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Current SOC</span>
                <p className="text-2xl font-black text-emerald-400 mt-0.5">{activeVehicle.soc}%</p>
                <span className="text-[11px] text-slate-400">Target: {activeVehicle.targetSoc}%</span>
              </div>

              <div className="bg-[#0B0F14] border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Charging Power</span>
                <p className="text-2xl font-black text-sky-400 mt-0.5">{activeVehicle.powerKw} kW</p>
                <span className="text-[11px] text-slate-400">Max: {activeVehicle.maxPowerKw} kW</span>
              </div>

              <div className="bg-[#0B0F14] border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Est. Range</span>
                <p className="text-2xl font-black text-white mt-0.5">{activeVehicle.rangeKm} km</p>
                <span className="text-[11px] text-slate-400">Efficiency 5.2 km/kWh</span>
              </div>

              <div className="bg-[#0B0F14] border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Departure</span>
                <p className="text-xl font-black text-amber-400 mt-1">{activeVehicle.departure}</p>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Guaranteed
                </span>
              </div>
            </div>

            {/* Slider Controls for Judges */}
            <div className="space-y-4 bg-[#0B0F14] p-4 rounded-xl border border-slate-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Interactive Telemetry Sliders
              </h3>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Force Battery SOC</span>
                  <span className="text-emerald-400 font-mono font-bold">{activeVehicle.soc}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={activeVehicle.soc}
                  onChange={(e) => {
                    const newSoc = Number(e.target.value);
                    setVehicles((prev) =>
                      prev.map((v) =>
                        v.id === activeVehicle.id
                          ? { ...v, soc: newSoc, rangeKm: Math.round((newSoc / 100) * v.capacityKwh * 4.3) }
                          : v
                      )
                    );
                  }}
                  className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Manual Power Override</span>
                  <span className="text-sky-400 font-mono font-bold">{activeVehicle.powerKw} kW</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={activeVehicle.maxPowerKw}
                  step="0.1"
                  value={activeVehicle.powerKw}
                  onChange={(e) => {
                    const newPower = Number(e.target.value);
                    setVehicles((prev) =>
                      prev.map((v) => (v.id === activeVehicle.id ? { ...v, powerKw: newPower } : v))
                    );
                  }}
                  className="w-full accent-sky-500 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
