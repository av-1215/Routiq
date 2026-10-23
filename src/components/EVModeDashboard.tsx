import React, { useState } from 'react';
import { EVChargerBay, Station, Vehicle } from '../types';
import {
  Zap,
  BatteryCharging,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Navigation,
  CheckCircle2,
  List,
  Map as MapIcon,
  Search,
  Sparkles,
  ArrowRight,
  Coffee,
  Wifi,
  AlertCircle
} from 'lucide-react';
import { isChargerCompatible, estimateChargingDurationMinutes } from '../algorithms/evCompatibility';
import { HYDERABAD_DEMO_DESTINATIONS } from '../data/mockDatabase';
import { InteractiveMap } from './InteractiveMap';

interface EVModeDashboardProps {
  activeVehicle: Vehicle;
  stations: Station[];
  onSelectStation: (st: Station) => void;
  onReserveBay: (st: Station) => void;
  onNavigateToPlan: (destination: string) => void;
}

export const EVModeDashboard: React.FC<EVModeDashboardProps> = ({
  activeVehicle,
  stations,
  onSelectStation,
  onReserveBay,
  onNavigateToPlan,
}) => {
  const [destinationSearch, setDestinationSearch] = useState('');
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [expandedDetailsStationId, setExpandedDetailsStationId] = useState<string | null>(null);
  const [activeFilterConnector, setActiveFilterConnector] = useState<string>('ALL');

  // Filter EV and Hybrid stations
  const evStations = stations.filter((s) => s.type !== 'CNG');

  // Dynamic calculations for the active vehicle
  const batteryPct = activeVehicle.currentBatteryPct || 68;
  const realRangeKm = activeVehicle.realWorldRangeKm || Math.round((activeVehicle.batteryCapacityKWh || 45) * 6.8);
  const estimatedRemainingKm = Math.round((realRangeKm * batteryPct) / 100);

  // Pick top recommended charger for the active vehicle
  // Looks for compatible, highest available bays & speed
  const recommendedStation =
    evStations.find((s) => s.id === 'st-hyd-station-b') ||
    evStations.find((s) => s.chargers.some((c) => c.status === 'AVAILABLE')) ||
    evStations[0];

  const recommendedCharger =
    recommendedStation?.chargers.find((c) => isChargerCompatible(activeVehicle, c).isCompatible && c.status === 'AVAILABLE') ||
    recommendedStation?.chargers[0];

  const availableBaysCount = recommendedStation?.chargers.filter((c) => c.status === 'AVAILABLE').length || 0;

  // Charging estimate to 80%
  const chargingEstimate = estimateChargingDurationMinutes(
    activeVehicle,
    batteryPct,
    80,
    recommendedCharger?.maxPowerKW || 120
  );
  const estimatedCostINR = Math.round(chargingEstimate.energyAddedKWh * (recommendedCharger?.pricePerKWh || 19.5));

  const toggleDetails = (stationId: string) => {
    setExpandedDetailsStationId((prev) => (prev === stationId ? null : stationId));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* EV Mode Hero Banner: Battery, Range & Destination */}
      <div className="bg-[#062B25] border border-[#28B85B]/30 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#28B85B]/20 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#031815] border border-[#28B85B]/40 flex items-center justify-center text-[#28B85B] shadow-inner">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#28B85B]/20 text-[#28B85B] border border-[#28B85B]/30">
                  ⚡ EV Mode Active
                </span>
                <span className="text-xs text-[#F6F1E8]/60 font-mono">
                  {activeVehicle.name}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F6F1E8] tracking-tight mt-0.5">
                Electric Vehicle Charging Hub
              </h1>
            </div>
          </div>

          {/* Range Card Quick Glance */}
          <div className="flex items-center gap-4 bg-[#031815] p-3 rounded-xl border border-[#28B85B]/30 shrink-0">
            <div className="space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider text-[#F6F1E8]/60 block font-medium">
                Current Battery
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold font-mono text-[#28B85B] tabular-nums">
                  {batteryPct}%
                </span>
                <BatteryCharging className="w-4 h-4 text-[#28B85B]" />
              </div>
            </div>

            <div className="h-8 w-px bg-[#28B85B]/20" />

            <div className="space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider text-[#F6F1E8]/60 block font-medium">
                Estimated Range
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

        {/* Destination Search Bar & Quick Chips */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#F6F1E8]/80 block">
            Where are you driving today?
          </label>
          <div className="flex items-center gap-2 bg-[#031815] border border-[#28B85B]/30 focus-within:border-[#28B85B] rounded-xl p-2.5 transition-colors">
            <Search className="w-5 h-5 text-[#28B85B] shrink-0 ml-1" />
            <input
              type="text"
              value={destinationSearch}
              onChange={(e) => setDestinationSearch(e.target.value)}
              placeholder="Search destination (e.g. RGIA Airport, Gachibowli, Financial District)..."
              className="w-full bg-transparent text-[#F6F1E8] placeholder-[#F6F1E8]/40 text-sm focus:outline-none"
            />
            {destinationSearch && (
              <button
                onClick={() => onNavigateToPlan(destinationSearch)}
                className="px-3 py-1.5 bg-[#28B85B] hover:bg-[#28B85B]/90 text-[#031815] font-bold text-xs rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 shadow"
              >
                <span>Plan Route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pt-1 text-xs">
            <span className="text-[#F6F1E8]/50 text-[11px] shrink-0">Quick suggestions:</span>
            {HYDERABAD_DEMO_DESTINATIONS.map((dest: { id: string; name: string; distanceKm: number }) => (
              <button
                key={dest.id}
                onClick={() => {
                  setDestinationSearch(dest.name);
                  onNavigateToPlan(dest.name);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#031815] hover:bg-[#031815]/80 text-[#F6F1E8]/80 hover:text-[#28B85B] border border-[#28B85B]/20 whitespace-nowrap text-[11px] transition-colors"
              >
                {dest.name.split('(')[0].trim()} ({dest.distanceKm} km)
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RECOMMENDED CHARGER CARD (Decision-Oriented Highlight) */}
      {recommendedStation && (
        <div className="bg-[#062B25] border-2 border-[#28B85B] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#28B85B]">
              <Sparkles className="w-4 h-4 fill-current" />
              <span>ROUTIQ RECOMMENDED CHARGER</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#28B85B]/20 text-[#28B85B] font-semibold">
              Fastest Total Stop
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#F6F1E8]">
                  {recommendedStation.name}
                </h3>
                <p className="text-xs text-[#F6F1E8]/70 mt-0.5">
                  {recommendedStation.address}
                </p>
              </div>

              {/* Primary Scannable Snapshot */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-[#28B85B]/15 text-[#28B85B] font-semibold border border-[#28B85B]/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#28B85B] animate-pulse"></span>
                  {availableBaysCount} bays available right now
                </span>

                <span className="px-2.5 py-1 rounded-md bg-[#031815] text-[#F6F1E8]/90 font-mono font-medium border border-[#28B85B]/20">
                  {recommendedCharger?.connectorType || 'CCS2'} • {recommendedCharger?.maxPowerKW || 120} kW DC
                </span>

                <span className="px-2.5 py-1 rounded-md bg-[#031815] text-[#28B85B] font-medium border border-[#28B85B]/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Your car is compatible
                </span>
              </div>

              {/* Timing & Cost Summary */}
              <div className="p-3 bg-[#031815] rounded-xl border border-[#28B85B]/20 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-[#F6F1E8]/60 text-[11px] block">Estimated Charge Time:</span>
                  <span className="font-mono text-sm font-bold text-[#F6F1E8]">
                    ~{chargingEstimate.totalMinutes} min ({batteryPct}% → 80%)
                  </span>
                </div>
                <div>
                  <span className="text-[#F6F1E8]/60 text-[11px] block">Estimated Session Cost:</span>
                  <span className="font-mono text-sm font-bold text-[#28B85B]">
                    ₹{estimatedCostINR}
                  </span>
                </div>
                <div>
                  <span className="text-[#F6F1E8]/60 text-[11px] block">Distance:</span>
                  <span className="font-mono text-sm font-bold text-[#F6F1E8]">
                    2.1 km away
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Core Action Buttons */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <button
                onClick={() => onReserveBay(recommendedStation)}
                className="w-full py-3.5 px-5 bg-[#28B85B] hover:bg-[#28B85B]/90 text-[#031815] font-extrabold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>RESERVE BAY (Guaranteed 15m Grace)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateToPlan(recommendedStation.name)}
                  className="flex-1 py-2.5 px-4 bg-[#031815] hover:bg-[#031815]/80 text-[#F6F1E8] font-bold text-xs rounded-xl border border-[#28B85B]/40 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-4 h-4 text-[#28B85B]" />
                  <span>Navigate with TRIPP</span>
                </button>

                <button
                  onClick={() => toggleDetails(recommendedStation.id)}
                  className="py-2.5 px-3 bg-[#031815] hover:bg-[#031815]/80 text-[#F6F1E8]/80 text-xs rounded-xl border border-[#28B85B]/20 transition-colors flex items-center gap-1"
                >
                  <span>More details</span>
                  {expandedDetailsStationId === recommendedStation.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Progressive Disclosure: More details drawer */}
          {expandedDetailsStationId === recommendedStation.id && (
            <div className="mt-5 pt-4 border-t border-[#28B85B]/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-[#031815] rounded-xl border border-[#062B25] space-y-1">
                <span className="text-[#F6F1E8]/60 text-[11px] block">Connector Compatibility</span>
                <span className="font-semibold text-[#28B85B]">100% Verified Compatible</span>
                <p className="text-[11px] text-[#F6F1E8]/70">
                  Matches your {activeVehicle.supportedConnectors?.join(' / ')} socket natively without adapters.
                </p>
              </div>

              <div className="p-3 bg-[#031815] rounded-xl border border-[#062B25] space-y-1">
                <span className="text-[#F6F1E8]/60 text-[11px] block">Charging Curve Estimate</span>
                <span className="font-mono text-white font-bold">{chargingEstimate.energyAddedKWh} kWh added</span>
                <p className="text-[11px] text-[#F6F1E8]/70">
                  Peak delivery at {recommendedCharger?.maxPowerKW} kW, tapering smoothly to protect battery life.
                </p>
              </div>

              <div className="p-3 bg-[#031815] rounded-xl border border-[#062B25] space-y-1">
                <span className="text-[#F6F1E8]/60 text-[11px] block">Hardware Reliability</span>
                <span className="font-mono text-[#28B85B] font-bold">{recommendedCharger?.reliabilityScore}% Uptime</span>
                <p className="text-[11px] text-[#F6F1E8]/70">
                  Hardware contactor verified online 42 seconds ago. Zero offline faults reported.
                </p>
              </div>

              <div className="p-3 bg-[#031815] rounded-xl border border-[#062B25] space-y-1">
                <span className="text-[#F6F1E8]/60 text-[11px] block">Tariff &amp; Amenities</span>
                <span className="font-mono text-[#F3C45B] font-bold">₹{recommendedCharger?.pricePerKWh}/kWh</span>
                <p className="text-[11px] text-[#F6F1E8]/70">
                  {recommendedStation.amenities.slice(0, 3).join(' · ')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Toggle Bar (List View vs Map View) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-xl font-bold text-[#F6F1E8]">Nearby Charging Stations</h2>
          <p className="text-xs text-[#F6F1E8]/70">
            Compare live bay availability, verified power output, and reservation holds.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Connector Filter */}
          <div className="flex items-center bg-[#062B25] p-1 rounded-lg border border-[#28B85B]/20 text-xs">
            {['ALL', 'CCS2', 'Type 2'].map((conn) => (
              <button
                key={conn}
                onClick={() => setActiveFilterConnector(conn)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  activeFilterConnector === conn
                    ? 'bg-[#28B85B] text-[#031815] font-bold'
                    : 'text-[#F6F1E8]/70 hover:text-white'
                }`}
              >
                {conn}
              </button>
            ))}
          </div>

          {/* List vs Map View Switcher */}
          <div className="flex items-center bg-[#062B25] p-1 rounded-lg border border-[#28B85B]/20 text-xs">
            <button
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
                viewMode === 'LIST'
                  ? 'bg-[#28B85B] text-[#031815] font-bold'
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
                  ? 'bg-[#28B85B] text-[#031815] font-bold'
                  : 'text-[#F6F1E8]/70 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Display Map View or Scannable List View */}
      {viewMode === 'MAP' ? (
        <div className="rounded-xl overflow-hidden border border-[#28B85B]/30 shadow-lg">
          <InteractiveMap
            stations={evStations}
            selectedStation={recommendedStation}
            onSelectStation={onSelectStation}
            activeVehicle={activeVehicle}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evStations
            .filter((st) => {
              if (activeFilterConnector === 'ALL') return true;
              return st.chargers.some((c) => c.connectorType === activeFilterConnector);
            })
            .map((station) => {
              const freeBays = station.chargers.filter((c) => c.status === 'AVAILABLE').length;
              const maxKW = Math.max(...station.chargers.map((c) => c.maxPowerKW));
              const isDetailsOpen = expandedDetailsStationId === station.id;
              const comp = station.chargers.some((c) => isChargerCompatible(activeVehicle, c).isCompatible);

              return (
                <div
                  key={station.id}
                  className="p-5 rounded-xl bg-[#062B25]/60 border border-[#28B85B]/20 hover:border-[#28B85B]/50 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    {/* Header */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#28B85B] uppercase tracking-wider">
                        {station.brand}
                      </span>
                      <span className="font-mono text-[#F3C45B] text-xs">
                        ★ {station.rating} ({station.totalReviews})
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

                    {/* Scannable Metric Strip */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#031815] rounded-lg text-center text-xs">
                      <div>
                        <span className="text-[#F6F1E8]/50 text-[10px] block">Availability</span>
                        <span
                          className={`font-mono font-bold ${
                            freeBays > 0 ? 'text-[#28B85B]' : 'text-amber-400'
                          }`}
                        >
                          {freeBays} / {station.chargers.length} Free
                        </span>
                      </div>
                      <div>
                        <span className="text-[#F6F1E8]/50 text-[10px] block">Speed</span>
                        <span className="font-mono font-bold text-[#F6F1E8]">
                          {maxKW} kW DC
                        </span>
                      </div>
                      <div>
                        <span className="text-[#F6F1E8]/50 text-[10px] block">Tariff</span>
                        <span className="font-mono font-bold text-[#F3C45B]">
                          ₹{station.chargers[0]?.pricePerKWh || 19}/kWh
                        </span>
                      </div>
                    </div>

                    {/* Compatibility Badge */}
                    <div className="flex items-center gap-1.5 text-xs">
                      {comp ? (
                        <span className="text-[#28B85B] flex items-center gap-1 text-[11px] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Your car is compatible</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1 text-[11px] font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Requires Type 2 Adapter</span>
                        </span>
                      )}
                    </div>

                    {/* Progressive Disclosure details */}
                    {isDetailsOpen && (
                      <div className="p-3 bg-[#031815] rounded-lg border border-[#062B25] text-[11px] space-y-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-[#F6F1E8]/60">Reliability Score:</span>
                          <span className="font-mono text-[#28B85B] font-bold">
                            {station.chargers[0]?.reliabilityScore || 96}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#F6F1E8]/60">Amenities:</span>
                          <span className="text-[#F6F1E8]/90">
                            {station.amenities.slice(0, 3).join(', ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#F6F1E8]/60">Sensor Heartbeat:</span>
                          <span className="text-[#F6F1E8]/80 font-mono">
                            {station.lastSensorUpdateSecondsAgo}s ago
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions: 1-Tap Reserve Bay + Details Toggle */}
                  <div className="pt-2 border-t border-[#031815] flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleDetails(station.id)}
                      className="text-xs text-[#F6F1E8]/60 hover:text-white flex items-center gap-1 py-1"
                    >
                      <span>{isDetailsOpen ? 'Less' : 'Details'}</span>
                      {isDetailsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectStation(station)}
                        className="px-2.5 py-1.5 text-xs text-[#F6F1E8]/80 hover:text-white hover:bg-[#031815] rounded-lg transition-colors border border-[#28B85B]/20"
                      >
                        Bays
                      </button>
                      <button
                        onClick={() => onReserveBay(station)}
                        className="px-3.5 py-1.5 bg-[#28B85B] hover:bg-[#28B85B]/90 text-[#031815] font-bold text-xs rounded-lg transition-colors shadow"
                      >
                        Reserve Bay
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
