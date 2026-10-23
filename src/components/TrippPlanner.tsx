import React, { useState, useEffect } from 'react';
import { RouteComparisonOption, Station, TrippPlan, Vehicle } from '../types';
import { planTrippJourney, recalculateTripLive, calculateAdaptiveRangeKm } from '../algorithms/trippEngine';
import {
  Compass,
  Zap,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Activity,
  CheckCircle2,
  Leaf,
  Fuel,
  Sliders,
  BatteryCharging,
  Gauge,
  Navigation
} from 'lucide-react';

interface TrippPlannerProps {
  vehicle: Vehicle;
  stations: Station[];
  onReserveStopCharger: (station: Station) => void;
  initialDestination?: string;
}

export const TrippPlanner: React.FC<TrippPlannerProps> = ({
  vehicle,
  stations,
  onReserveStopCharger,
  initialDestination,
}) => {
  const [origin, setOrigin] = useState('Hitec City (Cyber Towers), Hyderabad');
  const [destination, setDestination] = useState(
    initialDestination || 'Rajiv Gandhi International Airport (RGIA), Shamshabad'
  );
  const [totalKm, setTotalKm] = useState(38.5);

  // User-Controlled Battery Targets (Section 5 requirement)
  const [currentBatteryPct, setCurrentBatteryPct] = useState(vehicle.currentBatteryPct || 62);
  const [targetArrivalSoC, setTargetArrivalSoC] = useState(20); // Arrive at charger target %
  const [targetDepartureSoC, setTargetDepartureSoC] = useState(80); // Leave charger target %

  const [selectedRouteType, setSelectedRouteType] = useState<
    'FASTEST' | 'CHEAPEST' | 'LOWEST_WAIT' | 'GREENEST'
  >('LOWEST_WAIT');

  const [plan, setPlan] = useState<TrippPlan | null>(null);

  // Live simulation & rerouting state
  const [simStep, setSimStep] = useState(0); // 0: Start, 1: Driving, 2: Anomaly / Queue Surge, 3: Rerouted, 4: Arrived
  const [simAlert, setSimAlert] = useState<{
    message: string;
    submessage: string;
    isRerouted: boolean;
    alternateStop?: string;
  } | null>(null);

  // Synchronize initialDestination if changed from parent
  useEffect(() => {
    if (initialDestination) {
      setDestination(initialDestination);
    }
  }, [initialDestination]);

  // Dynamic calculations based on user-controlled targets
  const batteryCap = vehicle.batteryCapacityKWh || 45;
  const energyNeededKWh = Math.max(
    0,
    Math.round(((targetDepartureSoC - targetArrivalSoC) / 100) * batteryCap * 10) / 10
  );
  const chargerPowerKW = 120; // 120 kW DC Fast
  const estChargeMinutes = Math.max(
    8,
    Math.round((energyNeededKWh / chargerPowerKW) * 60 * 1.15) // includes tapering overhead
  );
  const estChargeCostINR = Math.round(energyNeededKWh * 18.5);

  // Arrival SoC at final destination
  // Consumption ~ 0.14 kWh/km for EV car
  const remainingLegKm = 24.5;
  const legEnergyKWh = remainingLegKm * 0.14;
  const arrivalDestinationSoC = Math.max(
    5,
    Math.round(targetDepartureSoC - (legEnergyKWh / batteryCap) * 100)
  );

  // Real-world range calculation
  const adaptiveRange = calculateAdaptiveRangeKm(vehicle);

  // 4 Core Route Options
  const routeOptions: RouteComparisonOption[] = [
    {
      type: 'LOWEST_WAIT',
      title: 'Lowest Wait (Recommended)',
      durationMinutes: 38 + estChargeMinutes,
      distanceKm: totalKm,
      costINR: estChargeCostINR,
      co2OffsetKg: 4.8,
      queueMinutes: 3,
      stopName: 'Jio-bp pulse (Gachibowli ORR)',
      stopType: vehicle.type === 'EV' ? 'EV' : 'CNG',
      badge: 'Zero Queuing Overhead',
      recommendedReason: 'Bypasses Madhapur 35-min queue; 2.1 km farther, saves ~23 min overall.',
    },
    {
      type: 'FASTEST',
      title: 'Fastest Highway Corridor',
      durationMinutes: 35 + estChargeMinutes,
      distanceKm: totalKm - 1.2,
      costINR: estChargeCostINR + 40,
      co2OffsetKg: 4.2,
      queueMinutes: 14,
      stopName: 'HPCL Shamshabad Transit Plaza',
      stopType: vehicle.type === 'EV' ? 'EV' : 'CNG',
      badge: 'Minimum Drive Time',
      recommendedReason: 'Direct via PVNR Expressway with higher average corridor speed.',
    },
    {
      type: 'CHEAPEST',
      title: 'Cheapest Tariff Corridor',
      durationMinutes: 44 + estChargeMinutes,
      distanceKm: totalKm + 1.8,
      costINR: Math.round(estChargeCostINR * 0.85),
      co2OffsetKg: 4.5,
      queueMinutes: 8,
      stopName: 'BPCL Smart Energy Hub (Nanakramguda)',
      stopType: vehicle.type === 'EV' ? 'EV' : 'CNG',
      badge: '₹55 Cheaper Tariff',
      recommendedReason: 'Solar microgrid off-peak tariff (₹14.5/kWh vs ₹18.5/kWh standard).',
    },
    {
      type: 'GREENEST',
      title: '100% Solar Green Corridor',
      durationMinutes: 41 + estChargeMinutes,
      distanceKm: totalKm + 0.5,
      costINR: estChargeCostINR,
      co2OffsetKg: 6.2,
      queueMinutes: 5,
      stopName: 'Inorbit Cyber Solar Hub',
      stopType: 'EV',
      badge: 'Zero Grid Carbon',
      recommendedReason: 'Direct rooftop solar microgrid charging with local battery buffering.',
    },
  ];

  const activeRoute = routeOptions.find((r) => r.type === selectedRouteType) || routeOptions[0];

  // Simulation handler
  const handleSimulationProgress = () => {
    if (simStep === 0) {
      setSimStep(1);
      setSimAlert({
        message: 'Trip Started: En route on Hitec City Flyover',
        submessage: `Current Battery: ${currentBatteryPct}%. Target Arrival at charger: ${targetArrivalSoC}%. Live GPS synced.`,
        isRerouted: false,
      });
    } else if (simStep === 1) {
      setSimStep(2);
      setSimAlert({
        message: '⚠️ Telemetry Alert: Sudden Queue Surge at Stop A (+18m delay)',
        submessage:
          'Madhapur CNG/EV hub reported unexpected queue surge. Routiq recommends switching to Jio-bp Gachibowli to save 19 mins.',
        isRerouted: true,
        alternateStop: 'Jio-bp pulse (Gachibowli ORR)',
      });
    } else if (simStep === 2) {
      setSimStep(3);
      setSimAlert({
        message: 'Reroute Accepted: Arrived at Jio-bp Gachibowli Bay 01',
        submessage: `Hardware lock verified. Charging at ${chargerPowerKW} kW. Estimated duration: ${estChargeMinutes} min.`,
        isRerouted: false,
      });
    } else if (simStep === 3) {
      setSimStep(4);
      setSimAlert({
        message: '🏁 Journey Completed: Reached Destination Safely',
        submessage: `Final Battery: ${arrivalDestinationSoC}% (Safe reserve intact). 0 minutes wasted in traffic queues.`,
        isRerouted: false,
      });
    } else {
      setSimStep(0);
      setSimAlert(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#07130F] border border-[#25C269]/25 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#25C269]" />
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                TRIPP — Intelligent Corridor Engine
              </h2>
            </div>
            <p className="text-xs text-[#F6F1E8]/70 mt-1">
              Dynamic, traffic-aware multi-stop route planning. Optimizes total journey time (Drive + Queue + Service) for Indian roads.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-[#25C269]/15 text-[#25C269] font-mono font-bold border border-[#25C269]/30">
              Corridor De-Congestion Active
            </span>
          </div>
        </div>

        {/* Inline Editable Route Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#062B25]">
          <div>
            <label className="text-[11px] font-bold text-[#F6F1E8]/60 uppercase tracking-wider block mb-1">
              Origin (Departure Point)
            </label>
            <div className="flex items-center gap-2 p-2.5 bg-[#031815] rounded-xl border border-[#062B25] text-xs">
              <MapPin className="w-4 h-4 text-[#25C269] shrink-0" />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-transparent text-white focus:outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#F6F1E8]/60 uppercase tracking-wider block mb-1">
              Destination (Target Arrival)
            </label>
            <div className="flex items-center gap-2 p-2.5 bg-[#031815] rounded-xl border border-[#062B25] text-xs">
              <Navigation className="w-4 h-4 text-[#168BDB] shrink-0" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-transparent text-white focus:outline-none font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* User-Controlled Battery Target Control Panel (Core Requirement) */}
      <div className="bg-[#07130F] border-2 border-[#25C269]/40 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#062B25] pb-3">
          <div className="flex items-center gap-2">
            <BatteryCharging className="w-4 h-4 text-[#25C269]" />
            <h3 className="font-extrabold text-white text-sm">
              User-Controlled Energy &amp; Battery Targets
            </h3>
          </div>
          <span className="text-[11px] text-[#25C269] font-mono">
            Interactive Sliders · Live Recalculation
          </span>
        </div>

        {/* 3 Interactive Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Slider 1: Battery Now */}
          <div className="p-3.5 bg-[#031815] rounded-xl border border-[#062B25] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#F6F1E8]/70 font-semibold">1. Battery Now</span>
              <span className="font-mono font-extrabold text-white text-sm">
                {currentBatteryPct}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={currentBatteryPct}
              onChange={(e) => setCurrentBatteryPct(Number(e.target.value))}
              className="w-full accent-[#25C269] cursor-pointer"
            />
            <span className="text-[10px] text-[#F6F1E8]/50 block">
              Est. Range: ~{Math.round((currentBatteryPct / 100) * 330)} km
            </span>
          </div>

          {/* Slider 2: Arrive at Charger With Target */}
          <div className="p-3.5 bg-[#031815] rounded-xl border border-[#062B25] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#F6F1E8]/70 font-semibold">2. Arrive at Charger</span>
              <span className="font-mono font-extrabold text-[#168BDB] text-sm">
                {targetArrivalSoC}% Target
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="35"
              value={targetArrivalSoC}
              onChange={(e) => setTargetArrivalSoC(Number(e.target.value))}
              className="w-full accent-[#168BDB] cursor-pointer"
            />
            <span className="text-[10px] text-[#F6F1E8]/50 block">
              Safety Buffer: ~{Math.round((targetArrivalSoC / 100) * 330)} km reserve
            </span>
          </div>

          {/* Slider 3: Leave Charger With Target */}
          <div className="p-3.5 bg-[#031815] rounded-xl border border-[#062B25] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#F6F1E8]/70 font-semibold">3. Leave Charger</span>
              <span className="font-mono font-extrabold text-[#25C269] text-sm">
                {targetDepartureSoC}% Target
              </span>
            </div>
            <input
              type="range"
              min="60"
              max="95"
              value={targetDepartureSoC}
              onChange={(e) => setTargetDepartureSoC(Number(e.target.value))}
              className="w-full accent-[#25C269] cursor-pointer"
            />
            <span className="text-[10px] text-[#F6F1E8]/50 block">
              Departure Range: ~{Math.round((targetDepartureSoC / 100) * 330)} km
            </span>
          </div>
        </div>

        {/* Visual Energy Projection Timeline Graph */}
        <div className="p-4 bg-[#031815] rounded-xl border border-[#25C269]/30 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              Visual Energy Projection Curve
            </span>
            <span className="font-mono text-[#25C269] font-bold">
              +{energyNeededKWh} kWh added · ~{estChargeMinutes}m charge · ₹{estChargeCostINR}
            </span>
          </div>

          {/* Stepped Progress Curve Bar */}
          <div className="relative pt-2 pb-6">
            <div className="h-2.5 bg-[#07130F] rounded-full overflow-hidden flex border border-[#062B25]">
              <div
                style={{ width: `${currentBatteryPct}%` }}
                className="bg-[#25C269] transition-all duration-300"
              />
              <div
                style={{ width: `${100 - currentBatteryPct}%` }}
                className="bg-[#031815] transition-all duration-300"
              />
            </div>

            {/* Stepped Timeline Markers */}
            <div className="grid grid-cols-4 gap-2 pt-3 text-center text-xs">
              <div className="space-y-0.5">
                <span className="font-mono font-bold text-white block">{currentBatteryPct}%</span>
                <span className="text-[10px] text-[#F6F1E8]/60 block">1. Start Drive</span>
              </div>
              <div className="space-y-0.5">
                <span className="font-mono font-bold text-[#168BDB] block">{targetArrivalSoC}%</span>
                <span className="text-[10px] text-[#F6F1E8]/60 block">2. Reach Hub</span>
              </div>
              <div className="space-y-0.5">
                <span className="font-mono font-bold text-[#25C269] block">
                  {targetDepartureSoC}%
                </span>
                <span className="text-[10px] text-[#F6F1E8]/60 block">3. Leave Hub</span>
              </div>
              <div className="space-y-0.5">
                <span className="font-mono font-bold text-white block">
                  {arrivalDestinationSoC}%
                </span>
                <span className="text-[10px] text-[#F6F1E8]/60 block">4. Final Arrival</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Strategy Route Comparison Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#F6F1E8]/70">
          Compare Routing Strategies
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {routeOptions.map((opt) => {
            const isSelected = selectedRouteType === opt.type;
            return (
              <div
                key={opt.type}
                onClick={() => setSelectedRouteType(opt.type)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-[#031815] border-2 border-[#25C269] shadow-xl ring-1 ring-[#25C269]/30'
                    : 'bg-[#07130F] border-[#062B25] hover:border-[#25C269]/40'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-[#07130F] text-[#25C269] border border-[#25C269]/30">
                      {opt.badge}
                    </span>
                    <span className="text-xs font-bold font-mono text-white">
                      {opt.durationMinutes} min
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">{opt.title}</h4>

                  <div className="space-y-1 text-xs text-[#F6F1E8]/70 text-[11px]">
                    <div className="flex justify-between">
                      <span>Est. Energy Cost:</span>
                      <span className="font-mono text-white font-semibold">₹{opt.costINR}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Queue Idling:</span>
                      <span className="font-mono text-[#25C269] font-semibold">{opt.queueMinutes} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbon Offset:</span>
                      <span className="font-mono text-[#168BDB] font-semibold">+{opt.co2OffsetKg} kg</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#F6F1E8]/60 pt-1 border-t border-[#062B25] leading-normal">
                    {opt.recommendedReason}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-[#25C269]">
                  <span>{isSelected ? '✓ Route Active' : 'Select Strategy'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Corridor Simulation & Live Rerouting Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Simulation Engine */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-[#07130F] rounded-2xl border border-[#25C269]/30 space-y-4 text-xs shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#25C269]" />
                <span className="font-extrabold text-white uppercase tracking-wider text-xs">
                  Live Dynamic Corridor Engine
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#25C269] font-bold">
                Step {simStep} of 4
              </span>
            </div>

            {/* Alert / Rerouting Banner */}
            {simAlert && (
              <div
                className={`p-3.5 rounded-xl border space-y-2 text-xs ${
                  simAlert.isRerouted
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                    : 'bg-[#031815] border-[#25C269]/40 text-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {simAlert.isRerouted ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[#25C269] shrink-0" />
                  )}
                  <span>{simAlert.message}</span>
                </div>
                <p className="text-[11px] opacity-90 leading-relaxed">{simAlert.submessage}</p>

                {simAlert.isRerouted && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleSimulationProgress}
                      className="px-3 py-1.5 bg-[#25C269] text-[#07130F] font-bold rounded-lg text-xs"
                    >
                      Accept Recommended Alternate
                    </button>
                    <button
                      onClick={handleSimulationProgress}
                      className="px-3 py-1.5 bg-[#07130F] text-white border border-[#062B25] rounded-lg text-xs"
                    >
                      Keep Current Stop
                    </button>
                  </div>
                )}
              </div>
            )}

            <p className="text-[#F6F1E8]/70 text-[11px] leading-relaxed">
              Experience TRIPP's real-time dynamic rerouting algorithm as it detects sudden queue spikes or charger outages along the Hyderabad highway corridor.
            </p>

            <button
              onClick={handleSimulationProgress}
              className="w-full py-2.5 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow"
            >
              {simStep === 4 ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Simulation</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>
                    {simStep === 0
                      ? 'Step 1: Start Driving from Hitec City'
                      : simStep === 1
                      ? 'Step 2: Simulate Sudden Queue Surge (+18m)'
                      : simStep === 2
                      ? 'Step 3: Service at Recommended Station'
                      : 'Step 4: Reach Airport (Final Destination)'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Journey Waypoints & Lock Station Action */}
        <div className="lg:col-span-7 space-y-3">
          <h4 className="text-xs font-bold text-[#F6F1E8]/80 uppercase tracking-wider">
            Optimized Corridor Milestones
          </h4>

          {/* Waypoint 1: Departure */}
          <div className="p-3.5 bg-[#07130F] rounded-xl border border-[#062B25] flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#031815] text-[#25C269] flex items-center justify-center font-bold text-xs border border-[#25C269]/30">
                0
              </div>
              <div>
                <div className="font-bold text-white">{origin}</div>
                <div className="text-[#F6F1E8]/50 text-[11px]">Departure Point · Km 0</div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-[#25C269] font-bold">{currentBatteryPct}% SoC</span>
              <span className="text-[10px] text-[#F6F1E8]/40 block">Live Telemetry</span>
            </div>
          </div>

          {/* Waypoint 2: Recommended Station Stop */}
          <div className="p-4 bg-[#07130F] rounded-2xl border-2 border-[#25C269] space-y-3 text-xs shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#25C269] text-[#07130F] font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{activeRoute.stopName}</div>
                  <div className="text-[#F6F1E8]/60 text-[11px]">
                    Waypoint km 14.2 · Recommended Smart Stop
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-[#25C269] font-bold text-sm">
                  ~{activeRoute.queueMinutes}m queue
                </span>
                <span className="text-[10px] text-[#F6F1E8]/50 block">De-congested</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#062B25]">
              <span className="text-[11px] text-[#25C269] font-semibold">
                Charge from {targetArrivalSoC}% to {targetDepartureSoC}% (~{estChargeMinutes}m)
              </span>

              <button
                onClick={() => {
                  const matched =
                    stations.find((s) => s.id === 'st-hyd-jiocng-gachibowli') || stations[1];
                  onReserveStopCharger(matched);
                }}
                className="px-3.5 py-1.5 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Reserve Bay for Stop</span>
              </button>
            </div>
          </div>

          {/* Waypoint 3: Destination Arrival */}
          <div className="p-3.5 bg-[#07130F] rounded-xl border border-[#062B25] flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#25C269]/20 text-[#25C269] flex items-center justify-center font-bold text-xs">
                🏁
              </div>
              <div>
                <div className="font-bold text-white">{destination}</div>
                <div className="text-[#F6F1E8]/50 text-[11px]">
                  Final Destination · Total ~{activeRoute.durationMinutes} min
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-[#25C269] font-bold">
                {arrivalDestinationSoC}% Safe Reserve
              </span>
              <span className="text-[10px] text-[#F6F1E8]/40 block">Guaranteed Buffer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
