import React, { useState } from 'react';
import { CNGDispenser, CNGGreenWindow, Station, Vehicle } from '../types';
import {
  Fuel,
  Clock,
  Gauge,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Navigation,
  List,
  Map as MapIcon,
  Search,
  ChevronDown,
  ChevronUp,
  Activity,
  ShieldCheck,
  TrendingUp,
  Zap
} from 'lucide-react';
import { HYDERABAD_DEMO_DESTINATIONS } from '../data/mockDatabase';
import { InteractiveMap } from './InteractiveMap';

interface CNGModeDashboardProps {
  activeVehicle: Vehicle;
  stations: Station[];
  onSelectStation: (st: Station) => void;
  onAssignGreenWindow: (st: Station) => void;
  onNavigateToPlan: (destination: string) => void;
  onTriggerSimulatedQueueSurge?: () => void;
}

export const CNGModeDashboard: React.FC<CNGModeDashboardProps> = ({
  activeVehicle,
  stations,
  onSelectStation,
  onAssignGreenWindow,
  onNavigateToPlan,
  onTriggerSimulatedQueueSurge,
}) => {
  const [destinationSearch, setDestinationSearch] = useState('');
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [expandedStationId, setExpandedStationId] = useState<string | null>('st-hyd-station-b');
  const [queueSurgeAlert, setQueueSurgeAlert] = useState<boolean>(false);

  // Filter CNG and Hybrid stations
  const cngStations = stations.filter((s) => s.type !== 'EV');

  // Specific Hyderabad corridor queue comparison (Station A, B, C)
  const stationA = cngStations.find((s) => s.id === 'st-hyd-station-a') || cngStations[0];
  const stationB = cngStations.find((s) => s.id === 'st-hyd-station-b') || cngStations[1];
  const stationC = cngStations.find((s) => s.id === 'st-hyd-station-c') || cngStations[2];

  // Gas capacity / mileage info
  const cylinderCapacityKg = activeVehicle.cylinderCapacityKg || 10;
  const currentFuelKg = activeVehicle.currentFuelKg || (cylinderCapacityKg * 0.7);
  const mileageKmPerKg = activeVehicle.mileageKmPerKg || 31;
  const estimatedRemainingKm = Math.round(currentFuelKg * mileageKmPerKg);

  const toggleDetails = (stationId: string) => {
    setExpandedStationId((prev) => (prev === stationId ? null : stationId));
  };

  const handleSimulateSurge = () => {
    setQueueSurgeAlert(true);
    onTriggerSimulatedQueueSurge?.();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* CNG Mode Hero Banner: Queue-Intelligence First Header */}
      <div className="bg-[#062B25] border border-[#168BDB]/30 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#168BDB]/20 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#031815] border border-[#168BDB]/40 flex items-center justify-center text-[#168BDB] shadow-inner">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#168BDB]/20 text-[#168BDB] border border-[#168BDB]/30">
                  ⛽ CNG Mode Active
                </span>
                <span className="text-xs text-[#F6F1E8]/60 font-mono">
                  {activeVehicle.name} ({activeVehicle.cngCategory || 'Car'})
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F6F1E8] tracking-tight mt-0.5">
                Dynamic CNG Queue Management
              </h1>
            </div>
          </div>

          {/* Quick Fuel & Range Status */}
          <div className="flex items-center gap-4 bg-[#031815] p-3 rounded-xl border border-[#168BDB]/30 shrink-0">
            <div className="space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider text-[#F6F1E8]/60 block font-medium">
                Current Gas Tank
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold font-mono text-[#168BDB] tabular-nums">
                  {currentFuelKg.toFixed(1)}
                </span>
                <span className="text-xs text-[#F6F1E8]/60 font-mono">/ {cylinderCapacityKg} kg</span>
              </div>
            </div>

            <div className="h-8 w-px bg-[#168BDB]/20" />

            <div className="space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider text-[#F6F1E8]/60 block font-medium">
                Gas Range
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold font-mono text-[#F6F1E8] tabular-nums">
                  ~{estimatedRemainingKm}
                </span>
                <span className="text-xs text-[#F6F1E8]/60 font-mono">km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Destination Search Bar */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#F6F1E8]/80 block">
            Where are you heading?
          </label>
          <div className="flex items-center gap-2 bg-[#031815] border border-[#168BDB]/30 focus-within:border-[#168BDB] rounded-xl p-2.5 transition-colors">
            <Search className="w-5 h-5 text-[#168BDB] shrink-0 ml-1" />
            <input
              type="text"
              value={destinationSearch}
              onChange={(e) => setDestinationSearch(e.target.value)}
              placeholder="Search destination (e.g. RGIA Airport, Gachibowli, Secunderabad)..."
              className="w-full bg-transparent text-[#F6F1E8] placeholder-[#F6F1E8]/40 text-sm focus:outline-none"
            />
            {destinationSearch && (
              <button
                onClick={() => onNavigateToPlan(destinationSearch)}
                className="px-3 py-1.5 bg-[#168BDB] hover:bg-[#168BDB]/90 text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 shadow"
              >
                <span>Plan with TRIPP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pt-1 text-xs">
            <span className="text-[#F6F1E8]/50 text-[11px] shrink-0">Popular:</span>
            {HYDERABAD_DEMO_DESTINATIONS.map((dest: { id: string; name: string; distanceKm: number }) => (
              <button
                key={dest.id}
                onClick={() => {
                  setDestinationSearch(dest.name);
                  onNavigateToPlan(dest.name);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#031815] hover:bg-[#031815]/80 text-[#F6F1E8]/80 hover:text-[#168BDB] border border-[#168BDB]/20 whitespace-nowrap text-[11px] transition-colors"
              >
                {dest.name.split('(')[0].trim()} ({dest.distanceKm} km)
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time Queue Surge Alert (Section 14 in Prompt) */}
      {queueSurgeAlert && (
        <div className="p-4 bg-amber-950/80 border-2 border-[#F3C45B] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-[#F3C45B] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#F3C45B] text-sm">
                ⚠️ Queue Increased at Station A (Madhapur)
              </div>
              <p className="text-[#F6F1E8]/80 mt-0.5">
                Station A is now expected to take <strong>38 min</strong> due to sudden commercial fleet arrivals. Station B is <strong>approximately 23 min faster</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => onAssignGreenWindow(stationB)}
              className="px-4 py-2 bg-[#28B85B] hover:bg-[#28B85B]/90 text-[#031815] font-bold text-xs rounded-lg transition-colors shadow"
            >
              GO TO STATION B
            </button>
            <button
              onClick={() => setQueueSurgeAlert(false)}
              className="px-2.5 py-2 text-xs text-[#F6F1E8]/60 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* CORE QUEUE COMPARISON STRIP (Station A vs Station B vs Station C) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#F6F1E8]">Nearby Stations Queue Comparison</h2>
            <p className="text-xs text-[#F6F1E8]/70">
              Ranked by total trip time (travel + queue + refuelling) rather than raw distance.
            </p>
          </div>

          {/* Test Queue Surge Button */}
          <button
            onClick={handleSimulateSurge}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#031815] hover:bg-[#062B25] text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Simulate Queue Surge</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Station A Card */}
          <div className="p-4 rounded-xl bg-[#062B25]/60 border border-red-500/30 relative space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#F6F1E8]">Station A · Madhapur</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">
                🔴 34 min queue
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-white line-clamp-1">{stationA?.name || 'Tata/BGL Madhapur'}</div>
              <div className="text-xs text-[#F6F1E8]/60">1.2 km away · PVNR Approach</div>
            </div>
            <div className="p-2.5 bg-[#031815] rounded-lg text-xs space-y-1">
              <div className="flex justify-between text-[#F6F1E8]/70">
                <span>Travel Time:</span>
                <span className="font-mono text-white">4 min</span>
              </div>
              <div className="flex justify-between text-[#F6F1E8]/70">
                <span>Expected Queue:</span>
                <span className="font-mono text-red-400 font-bold">~34 min</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#062B25] font-bold text-white">
                <span>Total Journey Stop:</span>
                <span className="font-mono text-red-400">~38 min</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] px-2 py-1 bg-[#031815] rounded border border-[#062B25]">
              <span className="flex items-center gap-1 text-[#25C269] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25C269] animate-pulse" />
                Live Refresh Rate: 5s
              </span>
              <span className="font-mono text-[#F6F1E8]/50">SCADA active</span>
            </div>
            <div className="text-[11px] text-amber-400/90 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>High chance of longer queue during peak hours.</span>
            </div>
          </div>

          {/* Station B Card (ROUTIQ RECOMMENDS) */}
          <div className="p-4 rounded-xl bg-[#062B25] border-2 border-[#28B85B] relative space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#28B85B] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Station B · Gachibowli</span>
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#28B85B]/20 text-[#28B85B] font-bold">
                🟢 7 min queue
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-white line-clamp-1">{stationB?.name || 'Jio-bp Gachibowli ORR'}</div>
              <div className="text-xs text-[#28B85B] font-medium">2.1 km away · Approximately 23 min faster</div>
            </div>
            <div className="p-2.5 bg-[#031815] rounded-lg text-xs space-y-1">
              <div className="flex justify-between text-[#F6F1E8]/70">
                <span>Travel Time:</span>
                <span className="font-mono text-white">7 min</span>
              </div>
              <div className="flex justify-between text-[#F6F1E8]/70">
                <span>Expected Queue:</span>
                <span className="font-mono text-[#28B85B] font-bold">~7 min</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#062B25] font-bold text-[#28B85B]">
                <span>Total Journey Stop:</span>
                <span className="font-mono">~14 min</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] px-2 py-1 bg-[#031815] rounded border border-[#28B85B]/30">
              <span className="flex items-center gap-1 text-[#28B85B] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#28B85B] animate-ping" />
                Live Refresh Rate: 5s
              </span>
              <span className="font-mono text-[#28B85B]">Real-time queue stream</span>
            </div>
            <div className="text-[11px] text-[#28B85B] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Recommended: Saves ~23 mins vs Station A</span>
            </div>
          </div>

          {/* Station C Card */}
          <div className="p-4 rounded-xl bg-[#062B25]/60 border border-[#28B85B]/30 relative space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#F6F1E8]">Station C · Financial Dist</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#28B85B]/20 text-[#28B85B] font-bold">
                🟢 4 min queue
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-white line-clamp-1">Adani Gas / Shell Financial District</div>
              <div className="text-xs text-[#F6F1E8]/60">2.8 km away · Fast Lane Open</div>
            </div>
            <div className="p-2.5 bg-[#031815] rounded-lg text-xs space-y-1">
              <div className="flex justify-between text-[#F6F1E8]/70">
                <span>Travel Time:</span>
                <span className="font-mono text-white">9 min</span>
              </div>
              <div className="flex justify-between text-[#F6F1E8]/70">
                <span>Expected Queue:</span>
                <span className="font-mono text-[#28B85B] font-bold">~4 min</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#062B25] font-bold text-white">
                <span>Total Journey Stop:</span>
                <span className="font-mono text-white">~13 min</span>
              </div>
            </div>
            <div className="text-[11px] text-[#F6F1E8]/70 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 shrink-0 text-[#28B85B]" />
              <span>Great alternate if travelling towards Nanakramguda.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ ROUTIQ RECOMMENDS HIGHLIGHT CARD (One-Tap Action) */}
      {stationB && (
        <div className="p-6 bg-gradient-to-r from-[#062B25] to-[#031815] border-2 border-[#28B85B] rounded-2xl shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#28B85B] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-4 h-4 fill-current" />
                  ROUTIQ RECOMMENDS
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#28B85B]/20 text-[#28B85B] font-bold">
                  Saves ~23 Minutes
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-[#F6F1E8]">
                {stationB.name}
              </h3>
              <p className="text-xs text-[#F6F1E8]/80 max-w-xl">
                2.1 km away · <strong>Approximately 23 min faster</strong> than the nearest station (Madhapur). 3 active dispensers and optimal line pressure.
              </p>

              {/* Plain Language Pressure Health Indicator */}
              <div className="pt-2 flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-[#031815] text-[#168BDB] font-mono font-medium border border-[#168BDB]/30 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5" />
                  Optimal 215 bar pressure — Full tank fill in ~4 minutes
                </span>
                <span className="text-[#28B85B] font-medium text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Estimate is highly reliable
                </span>
              </div>
            </div>

            {/* Direct One-Tap Core Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <button
                onClick={() => onNavigateToPlan(stationB.name)}
                className="py-3.5 px-6 bg-[#28B85B] hover:bg-[#28B85B]/90 text-[#031815] font-extrabold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Navigation className="w-4 h-4" />
                <span>NAVIGATE TO STATION B</span>
              </button>

              <button
                onClick={() => onAssignGreenWindow(stationB)}
                className="py-2.5 px-4 bg-[#031815] hover:bg-[#062B25] text-[#168BDB] border border-[#168BDB]/40 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Clock className="w-4 h-4" />
                <span>Assign Virtual Green Window</span>
              </button>
            </div>
          </div>

          {/* Progressive Disclosure: Timing Breakdown Toggle */}
          <div className="pt-3 border-t border-[#28B85B]/20">
            <button
              onClick={() => toggleDetails(stationB.id)}
              className="text-xs text-[#F6F1E8]/70 hover:text-white flex items-center gap-1"
            >
              <span>{expandedStationId === stationB.id ? 'Hide timing breakdown' : 'Show timing breakdown'}</span>
              {expandedStationId === stationB.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {expandedStationId === stationB.id && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 text-xs">
                <div className="p-2.5 bg-[#031815] rounded-lg border border-[#062B25]">
                  <span className="text-[#F6F1E8]/50 text-[10px] block">Travel Drive</span>
                  <span className="font-mono text-sm font-bold text-white">7 min</span>
                </div>
                <div className="p-2.5 bg-[#031815] rounded-lg border border-[#062B25]">
                  <span className="text-[#F6F1E8]/50 text-[10px] block">Expected Queue</span>
                  <span className="font-mono text-sm font-bold text-[#28B85B]">7 min</span>
                </div>
                <div className="p-2.5 bg-[#031815] rounded-lg border border-[#062B25]">
                  <span className="text-[#F6F1E8]/50 text-[10px] block">Refuelling Duration</span>
                  <span className="font-mono text-sm font-bold text-white">4 min</span>
                </div>
                <div className="p-2.5 bg-[#031815] rounded-lg border border-[#062B25]">
                  <span className="text-[#F6F1E8]/50 text-[10px] block">Total Stop Time</span>
                  <span className="font-mono text-sm font-bold text-[#28B85B]">18 min</span>
                </div>
                <div className="p-2.5 bg-[#031815] rounded-lg border border-[#062B25]">
                  <span className="text-[#F6F1E8]/50 text-[10px] block">Data Heartbeat</span>
                  <span className="font-mono text-xs text-[#F6F1E8]/80">Updated 42s ago</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Toggle Bar (List View vs Map View) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-xl font-bold text-[#F6F1E8]">All CNG Stations on Corridor</h2>
          <p className="text-xs text-[#F6F1E8]/70">
            Real-time dispenser pressure, queue lengths, and Green Window allocations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-[#062B25] p-1 rounded-lg border border-[#168BDB]/20 text-xs">
            <button
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
                viewMode === 'LIST'
                  ? 'bg-[#168BDB] text-white font-bold'
                  : 'text-[#F6F1E8]/70 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('MAP')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
                viewMode === 'MAP'
                  ? 'bg-[#168BDB] text-white font-bold'
                  : 'text-[#F6F1E8]/70 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Map or List View */}
      {viewMode === 'MAP' ? (
        <div className="rounded-xl overflow-hidden border border-[#168BDB]/30 shadow-lg">
          <InteractiveMap
            stations={cngStations}
            selectedStation={stationB}
            onSelectStation={onSelectStation}
            activeVehicle={activeVehicle}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cngStations.map((station) => {
            const avgPressure = station.dispensers[0]?.currentPressureBar || 205;
            const isCongested = station.congestionIndex > 1.1;

            return (
              <div
                key={station.id}
                className="p-5 rounded-xl bg-[#062B25]/60 border border-[#168BDB]/20 hover:border-[#168BDB]/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#168BDB] uppercase tracking-wider">
                      {station.brand}
                    </span>
                    <span
                      className={`font-mono text-[11px] px-2 py-0.5 rounded font-bold ${
                        isCongested
                          ? 'bg-amber-500/20 text-[#F3C45B]'
                          : 'bg-[#28B85B]/20 text-[#28B85B]'
                      }`}
                    >
                      {station.cngQueue.totalVehiclesAhead} Ahead (~{station.cngQueue.estimatedWaitMinutes}m)
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-[#F6F1E8] line-clamp-1">
                      {station.name}
                    </h4>
                    <p className="text-xs text-[#F6F1E8]/60 line-clamp-1 mt-0.5">
                      {station.address}
                    </p>
                  </div>

                  {/* Scannable Metrics */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#031815] rounded-lg text-center text-xs">
                    <div>
                      <span className="text-[#F6F1E8]/50 text-[10px] block">Pressure</span>
                      <span className="font-mono font-bold text-[#168BDB]">
                        {avgPressure} bar
                      </span>
                    </div>
                    <div>
                      <span className="text-[#F6F1E8]/50 text-[10px] block">Dispensers</span>
                      <span className="font-mono font-bold text-white">
                        {station.dispensers.length || 3} Active
                      </span>
                    </div>
                    <div>
                      <span className="text-[#F6F1E8]/50 text-[10px] block">Tariff</span>
                      <span className="font-mono font-bold text-[#F3C45B]">
                        ₹{station.cngPricePerKg || 88.5}/kg
                      </span>
                    </div>
                  </div>

                  {/* Plain Language Status */}
                  <div className="text-[11px] text-[#F6F1E8]/70 flex items-center gap-1.5">
                    {avgPressure >= 200 ? (
                      <span className="text-[#28B85B] flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>High pressure — Quick refill guaranteed</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Lower pressure — ~2 mins longer per car</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] px-2.5 py-1.5 bg-[#031815] rounded-lg border border-[#25C269]/20">
                    <span className="flex items-center gap-1.5 text-[#25C269] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25C269] animate-pulse" />
                      Live Refresh Rate: 5s
                    </span>
                    <span className="font-mono text-[#F6F1E8]/60">SCADA synced</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#031815] flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectStation(station)}
                    className="text-xs text-[#F6F1E8]/60 hover:text-white"
                  >
                    View Pumps
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigateToPlan(station.name)}
                      className="px-2.5 py-1.5 text-xs text-[#F6F1E8]/80 hover:text-white hover:bg-[#031815] rounded-lg border border-[#168BDB]/20"
                    >
                      Route
                    </button>
                    <button
                      onClick={() => onAssignGreenWindow(station)}
                      className="px-3 py-1.5 bg-[#168BDB] hover:bg-[#168BDB]/90 text-white font-bold text-xs rounded-lg transition-colors shadow"
                    >
                      Green Window
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
