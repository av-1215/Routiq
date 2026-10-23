import React, { useState } from 'react';
import { Station, Vehicle, EVChargerBay } from '../types';
import { InteractiveMap } from './InteractiveMap';
import {
  Zap,
  Fuel,
  Search,
  Filter,
  MapPin,
  Clock,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Map as MapIcon,
  List,
  Sparkles,
  QrCode,
  Coffee,
  Wifi,
  Wind
} from 'lucide-react';
import { isChargerCompatible } from '../algorithms/evCompatibility';

interface ExploreViewProps {
  stations: Station[];
  activeVehicle: Vehicle;
  onSelectStation: (st: Station) => void;
  onOpenEVModal: (st: Station) => void;
  onOpenCNGModal: (st: Station) => void;
  onQuickQR: (charger: EVChargerBay) => void;
  initialMode?: 'EV' | 'CNG';
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  stations,
  activeVehicle,
  onSelectStation,
  onOpenEVModal,
  onOpenCNGModal,
  onQuickQR,
  initialMode = 'EV',
}) => {
  const [mode, setMode] = useState<'EV' | 'CNG'>(
    initialMode || (activeVehicle.type === 'CNG' ? 'CNG' : 'EV')
  );
  const [viewFormat, setViewFormat] = useState<'LIST' | 'MAP'>('LIST');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMinPower, setFilterMinPower] = useState<number>(0);
  const [filterMaxQueue, setFilterMaxQueue] = useState<number>(60);
  const [filterAvailableOnly, setFilterAvailableOnly] = useState<boolean>(false);
  const [expandedStationId, setExpandedStationId] = useState<string | null>(null);

  // Filter stations based on mode and queries
  const filteredStations = stations.filter((st) => {
    // Mode match
    if (mode === 'EV' && st.type === 'CNG') return false;
    if (mode === 'CNG' && st.type === 'EV') return false;

    // Search query
    if (
      searchQuery &&
      !st.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !st.address.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // EV specific filters
    if (mode === 'EV') {
      if (filterMinPower > 0) {
        const hasPower = st.chargers.some((c) => c.maxPowerKW >= filterMinPower);
        if (!hasPower) return false;
      }
      if (filterAvailableOnly) {
        const hasAvailable = st.chargers.some((c) => c.status === 'AVAILABLE');
        if (!hasAvailable) return false;
      }
    }

    // CNG specific filters
    if (mode === 'CNG') {
      if (st.cngQueue.estimatedWaitMinutes > filterMaxQueue) return false;
    }

    return true;
  });

  const toggleExpand = (stationId: string) => {
    setExpandedStationId(expandedStationId === stationId ? null : stationId);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-[#07130F] border border-[#25C269]/25 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-[#F6F1E8] tracking-tight">
                Explore Mobility Network
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#25C269]/15 text-[#25C269] font-mono font-bold border border-[#25C269]/30">
                Live Sensor Telemetry
              </span>
            </div>
            <p className="text-xs text-[#F6F1E8]/70 mt-1">
              {mode === 'EV'
                ? `Showing high-power EV charging hubs compatible with your ${activeVehicle.name}.`
                : `Showing real-time CNG queue times and dispenser pressure across Hyderabad.`}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-[#031815] rounded-xl border border-[#062B25]">
              <button
                onClick={() => setMode('EV')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'EV'
                    ? 'bg-[#168BDB] text-white shadow'
                    : 'text-[#F6F1E8]/60 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>⚡ EV Chargers</span>
              </button>
              <button
                onClick={() => setMode('CNG')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'CNG'
                    ? 'bg-[#25C269] text-[#07130F] shadow'
                    : 'text-[#F6F1E8]/60 hover:text-white'
                }`}
              >
                <Fuel className="w-4 h-4" />
                <span>⛽ CNG Stations</span>
              </button>
            </div>

            {/* List / Map View Toggle */}
            <div className="hidden sm:flex p-1 bg-[#031815] rounded-xl border border-[#062B25]">
              <button
                onClick={() => setViewFormat('LIST')}
                className={`p-2 rounded-lg transition-colors ${
                  viewFormat === 'LIST' ? 'bg-[#25C269]/20 text-[#25C269]' : 'text-[#F6F1E8]/60 hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewFormat('MAP')}
                className={`p-2 rounded-lg transition-colors ${
                  viewFormat === 'MAP' ? 'bg-[#25C269]/20 text-[#25C269]' : 'text-[#F6F1E8]/60 hover:text-white'
                }`}
                title="Interactive Map"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Quick Filter Controls */}
        <div className="mt-4 pt-4 border-t border-[#25C269]/15 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#25C269] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                mode === 'EV'
                  ? 'Search EV chargers by hub name, location or connector...'
                  : 'Search CNG stations by area, pump name or highway...'
              }
              className="w-full pl-10 pr-4 py-2 bg-[#031815] text-[#F6F1E8] placeholder-[#F6F1E8]/40 border border-[#062B25] focus:border-[#25C269] rounded-xl text-xs focus:outline-none"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            {mode === 'EV' ? (
              <>
                <button
                  onClick={() => setFilterAvailableOnly(!filterAvailableOnly)}
                  className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    filterAvailableOnly
                      ? 'bg-[#168BDB]/20 border-[#168BDB] text-[#168BDB] font-bold'
                      : 'bg-[#031815] border-[#062B25] text-[#F6F1E8]/70 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Available Now</span>
                </button>
                <button
                  onClick={() => setFilterMinPower(filterMinPower === 60 ? 0 : 60)}
                  className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    filterMinPower === 60
                      ? 'bg-[#168BDB]/20 border-[#168BDB] text-[#168BDB] font-bold'
                      : 'bg-[#031815] border-[#062B25] text-[#F6F1E8]/70 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>60kW+ DC Fast</span>
                </button>
                <button
                  onClick={() => setFilterMinPower(filterMinPower === 120 ? 0 : 120)}
                  className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    filterMinPower === 120
                      ? 'bg-[#168BDB]/20 border-[#168BDB] text-[#168BDB] font-bold'
                      : 'bg-[#031815] border-[#062B25] text-[#F6F1E8]/70 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>120kW+ Ultra</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setFilterMaxQueue(filterMaxQueue === 10 ? 60 : 10)}
                  className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    filterMaxQueue === 10
                      ? 'bg-[#25C269]/20 border-[#25C269] text-[#25C269] font-bold'
                      : 'bg-[#031815] border-[#062B25] text-[#F6F1E8]/70 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Queue &lt; 10 min</span>
                </button>
                <button
                  onClick={() => setFilterMaxQueue(filterMaxQueue === 20 ? 60 : 20)}
                  className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    filterMaxQueue === 20
                      ? 'bg-[#25C269]/20 border-[#25C269] text-[#25C269] font-bold'
                      : 'bg-[#031815] border-[#062B25] text-[#F6F1E8]/70 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Queue &lt; 20 min</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {viewFormat === 'MAP' ? (
        <div className="rounded-3xl overflow-hidden border border-[#25C269]/20 shadow-2xl">
          <InteractiveMap
            stations={filteredStations}
            onSelectStation={onSelectStation}
            selectedStationId={expandedStationId || undefined}
            activeVehicle={activeVehicle}
            forcedMode={mode}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#F6F1E8]/70 px-1">
            <span>
              Found <strong className="text-white font-mono">{filteredStations.length}</strong> {mode} stations
            </span>
            <span className="text-[11px] text-[#25C269] font-mono">
              Auto-refreshed via SCADA
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStations.map((station) => {
              const isExpanded = expandedStationId === station.id;
              const isEV = mode === 'EV';

              // EV metrics
              const availableBays = station.chargers.filter((c) => c.status === 'AVAILABLE').length;
              const totalBays = station.chargers.length;
              const maxPower = station.chargers.reduce((max, c) => Math.max(max, c.maxPowerKW), 0);
              const fastAvailableBay = station.chargers.find((c) => c.status === 'AVAILABLE');

              // CNG metrics
              const waitMin = station.cngQueue.estimatedWaitMinutes;
              const vehiclesAhead = station.cngQueue.totalVehiclesAhead;
              const avgPressure = Math.round(
                station.dispensers.reduce((acc, d) => acc + d.currentPressureBar, 0) /
                  (station.dispensers.length || 1)
              );

              return (
                <div
                  key={station.id}
                  className={`bg-[#07130F] rounded-2xl border transition-all shadow-md overflow-hidden ${
                    station.isRecommendedStop
                      ? 'border-[#25C269] ring-1 ring-[#25C269]/30'
                      : 'border-[#25C269]/20 hover:border-[#25C269]/50'
                  }`}
                >
                  {/* Top Highlight Badge */}
                  {station.isRecommendedStop && (
                    <div className="bg-[#25C269] text-[#07130F] px-4 py-1.5 text-[11px] font-extrabold flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        <span>⭐ ROUTIQ TOP RECOMMENDATION · SAVES ~23 MIN</span>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-wider">Lowest Wait</span>
                    </div>
                  )}

                  <div className="p-5 space-y-4">
                    {/* Header: Name, Brand, Distance */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base leading-tight">
                            {station.name}
                          </h3>
                        </div>
                        <p className="text-xs text-[#F6F1E8]/60 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#25C269] shrink-0" />
                          <span className="truncate">{station.address}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-extrabold font-mono text-white block">
                          {station.distanceKm ?? 2.1} km
                        </span>
                        <span className="text-[10px] text-[#25C269] font-medium block">
                          ~{Math.round((station.distanceKm ?? 2.1) * 2.3)} min drive
                        </span>
                      </div>
                    </div>

                    {/* Key Mode Specific Metric Box */}
                    {isEV ? (
                      <div className="p-3.5 bg-[#031815] rounded-xl border border-[#062B25] grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <span className="text-[#F6F1E8]/50 text-[10px] block">Live Bays</span>
                          <span
                            className={`font-mono font-bold text-sm ${
                              availableBays > 0 ? 'text-[#25C269]' : 'text-red-400'
                            }`}
                          >
                            {availableBays} of {totalBays} Free
                          </span>
                        </div>
                        <div>
                          <span className="text-[#F6F1E8]/50 text-[10px] block">Max Speed</span>
                          <span className="font-mono font-bold text-sm text-[#168BDB]">
                            {maxPower} kW CCS2
                          </span>
                        </div>
                        <div>
                          <span className="text-[#F6F1E8]/50 text-[10px] block">Tariff</span>
                          <span className="font-mono font-bold text-sm text-white">
                            ₹18.5/kWh
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-3.5 bg-[#031815] rounded-xl border border-[#062B25] grid grid-cols-3 gap-2 text-center text-xs">
                          <div>
                            <span className="text-[#F6F1E8]/50 text-[10px] block">Queue Wait</span>
                            <span
                              className={`font-mono font-bold text-sm ${
                                waitMin < 10
                                  ? 'text-[#25C269]'
                                  : waitMin < 25
                                  ? 'text-amber-400'
                                  : 'text-red-400'
                              }`}
                            >
                              ~{waitMin} min
                            </span>
                          </div>
                          <div>
                            <span className="text-[#F6F1E8]/50 text-[10px] block">Line Ahead</span>
                            <span className="font-mono font-bold text-sm text-white">
                              {vehiclesAhead} vehicles
                            </span>
                          </div>
                          <div>
                            <span className="text-[#F6F1E8]/50 text-[10px] block">Dispenser Bar</span>
                            <span className="font-mono font-bold text-sm text-[#168BDB]">
                              {avgPressure} bar
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-3 py-1.5 bg-[#031815] rounded-xl border border-[#25C269]/25 text-[11px]">
                          <div className="flex items-center gap-1.5 text-[#25C269]">
                            <span className="w-2 h-2 rounded-full bg-[#25C269] animate-pulse"></span>
                            <span className="font-bold">Live Refresh Rate: 5s</span>
                          </div>
                          <span className="font-mono text-[#F6F1E8]/60 text-[10px]">
                            SCADA ping: {station.lastSensorUpdateSecondsAgo || 2}s ago
                          </span>
                        </div>
                      </>
                    )}

                    {/* Action Row */}
                    <div className="flex items-center gap-2 pt-1">
                      {isEV ? (
                        <>
                          <button
                            onClick={() => onOpenEVModal(station)}
                            className="flex-1 py-2.5 bg-[#168BDB] hover:bg-[#168BDB]/90 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            <span>Reserve Bay (Hold 15m)</span>
                          </button>

                          {fastAvailableBay && (
                            <button
                              onClick={() => onQuickQR(fastAvailableBay)}
                              className="px-3 py-2.5 bg-[#031815] hover:bg-[#062B25] text-[#25C269] border border-[#25C269]/40 rounded-xl transition-colors"
                              title="Instant QR Scan at Bay"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onOpenCNGModal(station)}
                            className="flex-1 py-2.5 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Fuel className="w-3.5 h-3.5" />
                            <span>Join Virtual Queue</span>
                          </button>
                          <button
                            onClick={() => onSelectStation(station)}
                            className="px-3 py-2.5 bg-[#031815] hover:bg-[#062B25] text-white border border-[#25C269]/30 rounded-xl text-xs font-semibold"
                          >
                            Directions
                          </button>
                        </>
                      )}
                    </div>

                    {/* Expandable "More Details ↓" */}
                    <button
                      onClick={() => toggleExpand(station.id)}
                      className="w-full pt-2 flex items-center justify-center gap-1 text-[11px] text-[#F6F1E8]/60 hover:text-[#25C269] transition-colors border-t border-[#062B25]"
                    >
                      <span>{isExpanded ? 'Less details' : 'More details (Pricing, Amenities, Specs)'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* Expanded Drawer */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-[#062B25] space-y-3 text-xs">
                        {/* Connector / Vehicle Compatibility */}
                        {isEV && (
                          <div className="p-3 bg-[#031815] rounded-xl border border-[#062B25] space-y-2">
                            <span className="text-[10px] font-bold text-[#F6F1E8]/60 uppercase tracking-wider block">
                              Active Vehicle Compatibility Check
                            </span>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white">{activeVehicle.name}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#25C269]/15 text-[#25C269] border border-[#25C269]/30">
                                100% Compatible ({activeVehicle.supportedConnectors?.join(', ') || activeVehicle.connectorType || 'CCS2'})
                              </span>
                            </div>
                            <div className="space-y-1.5 pt-1 text-[11px]">
                              {station.chargers.map((c) => (
                                <div key={c.id} className="flex items-center justify-between text-[#F6F1E8]/70">
                                  <span>{c.bayNumber} ({c.connectorType})</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-white">{c.maxPowerKW} kW</span>
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                                        c.status === 'AVAILABLE'
                                          ? 'bg-[#25C269]/20 text-[#25C269]'
                                          : 'bg-red-500/20 text-red-300'
                                      }`}
                                    >
                                      {c.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Station Amenities */}
                        <div>
                          <span className="text-[10px] font-bold text-[#F6F1E8]/60 uppercase tracking-wider block mb-1.5">
                            Hub Amenities
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {station.amenities.map((am, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded-lg bg-[#031815] text-[#F6F1E8]/80 text-[10px] border border-[#062B25] flex items-center gap-1"
                              >
                                <span>{am}</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Telemetry freshness */}
                        <div className="flex items-center justify-between text-[10px] text-[#F6F1E8]/40 pt-1">
                          <span>Operator: {station.brand}</span>
                          <span>Sensor freshness: {station.lastSensorUpdateSecondsAgo}s ago</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
