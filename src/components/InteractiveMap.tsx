import React, { useState } from 'react';
import { Station, StationType, Vehicle } from '../types';
import {
  Zap,
  Fuel,
  Coffee,
  Wifi,
  Sparkles,
  Navigation,
  Layers,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Plus,
  Minus,
  Maximize2
} from 'lucide-react';

interface InteractiveMapProps {
  stations: Station[];
  selectedStation?: Station | null;
  selectedStationId?: string;
  onSelectStation: (station: Station) => void;
  activeVehicle?: Vehicle;
  forcedMode?: 'EV' | 'CNG';
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  stations,
  selectedStation,
  selectedStationId,
  onSelectStation,
  activeVehicle,
  forcedMode,
}) => {
  const [filterType, setFilterType] = useState<StationType | 'ALL'>(forcedMode || 'ALL');
  const [selectedAmenity, setSelectedAmenity] = useState<string | null>(null);
  const [onlyHighSpeed, setOnlyHighSpeed] = useState<boolean>(false);
  const [activeCity, setActiveCity] = useState<string>('Hyderabad');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Sync forcedMode if provided
  React.useEffect(() => {
    if (forcedMode) {
      setFilterType(forcedMode);
    }
  }, [forcedMode]);

  // Filter stations
  const filteredStations = stations.filter((st) => {
    if (filterType !== 'ALL' && st.type !== filterType && st.type !== 'HYBRID') return false;
    if (selectedAmenity && !st.amenities.includes(selectedAmenity)) return false;
    if (onlyHighSpeed && st.type !== 'CNG') {
      const hasFastDC = st.chargers.some((c) => c.maxPowerKW >= 60);
      if (!hasFastDC) return false;
    }
    if (activeCity !== 'ALL' && st.city !== activeCity && st.highwayCorridor !== activeCity) return false;
    return true;
  });

  return (
    <div className="bg-[#062B25] rounded-3xl border border-[#25C269]/30 overflow-hidden shadow-2xl">
      {/* Top Filter Bar */}
      <div className="p-3.5 sm:p-4 border-b border-[#25C269]/20 flex flex-wrap items-center justify-between gap-3 bg-[#031815]/90">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#062B25] rounded-xl border border-[#25C269]/20">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'ALL' ? 'bg-[#25C269] text-[#031815] shadow font-bold' : 'text-[#F6F1E8]/70 hover:text-white'
            }`}
          >
            All Network ({stations.length})
          </button>
          <button
            onClick={() => setFilterType('EV')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'EV' ? 'bg-[#168BDB] text-white shadow font-bold' : 'text-[#F6F1E8]/70 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>⚡ EV Hubs</span>
          </button>
          <button
            onClick={() => setFilterType('CNG')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'CNG' ? 'bg-[#25C269] text-[#07130F] shadow font-bold' : 'text-[#F6F1E8]/70 hover:text-white'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>⛽ CNG Pumps</span>
          </button>
        </div>

        {/* Quick Corridor / City Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
          {['ALL', 'Hyderabad', 'Gurugram', 'NH 48', 'Mumbai', 'Bengaluru'].map((city) => (
            <button
              key={city}
              onClick={() => setActiveCity(city === 'NH 48' ? 'NH 48 (Delhi - Jaipur Highway)' : city)}
              className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-colors border ${
                (activeCity === city || (city === 'NH 48' && activeCity.includes('NH 48')))
                  ? 'border-[#25C269] text-[#25C269] bg-[#25C269]/15 font-bold shadow-sm'
                  : 'border-[#062B25] text-[#F6F1E8]/60 hover:text-white bg-[#031815]'
              }`}
            >
              {city === 'ALL' ? 'Pan-India' : city}
            </button>
          ))}
        </div>

        {/* Amenity / Speed Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyHighSpeed(!onlyHighSpeed)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors border ${
              onlyHighSpeed
                ? 'border-[#168BDB] bg-[#168BDB]/20 text-[#168BDB] font-bold'
                : 'border-[#062B25] bg-[#031815] text-[#F6F1E8]/60 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3 text-[#168BDB]" />
            <span>≥60 kW DC Fast</span>
          </button>

          <button
            onClick={() => setSelectedAmenity(selectedAmenity === 'Café' ? null : 'Café')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors border ${
              selectedAmenity === 'Café'
                ? 'border-[#F3C45B] bg-[#F3C45B]/20 text-[#F3C45B] font-bold'
                : 'border-[#062B25] bg-[#031815] text-[#F6F1E8]/60 hover:text-white'
            }`}
          >
            <Coffee className="w-3 h-3 text-[#F3C45B]" />
            <span>Café</span>
          </button>
        </div>
      </div>

      {/* Cartographic Visual Grid Canvas with Subtle Road Hierarchy */}
      <div className="relative h-96 sm:h-[480px] bg-[#031815] overflow-hidden select-none">
        {/* Soft cartographic background grid inspired by modern navigation */}
        <div className="absolute inset-0 bg-[radial-gradient(#062B25_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-60" />

        {/* Highway Corridors SVG Overlay with real coordinate arcs */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Ring Road (ORR) Hyderabad Expressway Loop */}
          <ellipse
            cx="340"
            cy="240"
            rx="180"
            ry="140"
            stroke="#25C269"
            strokeWidth="3"
            strokeDasharray="6 4"
            fill="none"
            opacity="0.6"
          />
          <text x="330" y="90" fill="#25C269" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
            HYDERABAD ORR SMART MOBILITY RING
          </text>

          {/* Radial Corridors: Hitec City to Shamshabad Airport */}
          <path
            d="M 270 140 L 320 210 L 340 260 L 390 350"
            stroke="#168BDB"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
          <text x="360" y="300" fill="#168BDB" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
            AIRPORT EXPRESSWAY (PVNR)
          </text>

          {/* NH 48 Delhi - Gurugram - Jaipur Highway */}
          <path
            d="M 520 60 L 590 140 L 630 200 L 680 270 L 730 350"
            stroke="#25C269"
            strokeWidth="2.5"
            strokeDasharray="5 3"
            fill="none"
            opacity="0.4"
          />
          <text x="600" y="160" fill="#25C269" fontSize="9" fontFamily="sans-serif" opacity="0.6">
            NH 48 HIGHWAY CORRIDOR
          </text>
        </svg>

        {/* Routiq Logo Branding Watermark on Map (Section 1 of specification) */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 p-2 px-3 rounded-2xl bg-[#07130F]/90 border border-[#25C269]/40 backdrop-blur-md shadow-xl pointer-events-auto">
          <img
            src="/routiq_logo.png"
            alt="Routiq"
            className="w-5 h-5 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-white leading-none">Routiq Maps</span>
            <span className="text-[8px] font-semibold text-[#25C269] leading-none">Smart Indian Grid Telemetry</span>
          </div>
        </div>

        {/* Map Zoom Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 p-1 bg-[#07130F]/90 border border-[#25C269]/30 rounded-xl shadow-lg backdrop-blur">
          <button
            onClick={() => setZoomLevel((prev) => Math.min(prev + 0.2, 1.6))}
            className="p-1.5 text-white hover:text-[#25C269] hover:bg-[#031815] rounded-lg transition-colors"
            title="Zoom in"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-px bg-[#062B25]" />
          <button
            onClick={() => setZoomLevel((prev) => Math.max(prev - 0.2, 0.8))}
            className="p-1.5 text-white hover:text-[#25C269] hover:bg-[#031815] rounded-lg transition-colors"
            title="Zoom out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute top-4 left-4 z-10 p-3 rounded-2xl bg-[#07130F]/90 border border-[#25C269]/30 text-[11px] text-[#F6F1E8]/80 space-y-2 shadow-xl backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#168BDB] border border-white/40 shadow-sm" />
            <span className="font-medium">⚡ EV Charging Bay (Power &amp; Bays)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#25C269] border border-white/40 shadow-sm" />
            <span className="font-medium">⛽ CNG Fast Flow (Queue &lt; 10 min)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F3C45B] border border-white/40 shadow-sm" />
            <span className="font-medium">⚠️ CNG Queue Surge (CI &gt; 1.2)</span>
          </div>
        </div>

        {/* Map Markers for Stations */}
        <div
          className="absolute inset-0 transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          {filteredStations.map((st) => {
            const isSelected = selectedStation?.id === st.id;

            // Map coordinates roughly onto canvas space
            let topPct = 50;
            let leftPct = 50;

            if (st.city === 'Hyderabad') {
              topPct = 20 + ((17.48 - st.coordinates.lat) / (17.48 - 17.20)) * 60;
              leftPct = 24 + ((st.coordinates.lng - 78.30) / (78.46 - 78.30)) * 52;
            } else {
              topPct = 75 - ((st.coordinates.lat - 12) / (29 - 12)) * 60;
              leftPct = 20 + ((st.coordinates.lng - 72) / (79 - 72)) * 60;
            }

            const isEV = st.type === 'EV' || st.type === 'HYBRID';
            const isCNG = st.type === 'CNG' || st.type === 'HYBRID';
            const availableEVBays = st.chargers.filter((c) => c.status === 'AVAILABLE').length;
            const maxKW = Math.max(...(st.chargers.map((c) => c.maxPowerKW) || [60]));
            const isHighCongestion = st.congestionIndex > 1.2 || st.cngQueue.estimatedWaitMinutes > 20;

            return (
              <div
                key={st.id}
                style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                onClick={() => onSelectStation(st)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
              >
                {/* Visual Circular Marker Design derived from specification & visual reference */}
                {isEV && (!isCNG || filterType === 'EV') ? (
                  // EV Circular Marker: Blue disc with lightning badge & speed
                  <div
                    className={`flex items-center gap-1.5 p-1.5 pr-3 rounded-full shadow-2xl transition-all duration-200 group-hover:scale-110 ${
                      isSelected
                        ? 'bg-[#168BDB] text-white ring-4 ring-[#168BDB]/40 scale-110 border-2 border-white'
                        : 'bg-[#07130F] border-2 border-[#168BDB] text-white hover:border-white'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#168BDB] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-[11px] font-black whitespace-nowrap">
                        {st.name.split('—')[0].replace('(Station', '').trim()}
                      </span>
                      <div className="flex items-center gap-1.5 text-[9px]">
                        <span className="font-mono text-[#168BDB] font-bold bg-[#168BDB]/20 px-1 rounded">
                          {maxKW}kW
                        </span>
                        <span className="text-[#25C269] font-bold">
                          {availableEVBays} bays free
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // CNG Circular Marker: Green/Amber/Red disc with wait time & vehicles ahead
                  <div
                    className={`flex items-center gap-1.5 p-1.5 pr-3 rounded-full shadow-2xl transition-all duration-200 group-hover:scale-110 ${
                      isSelected
                        ? 'bg-[#25C269] text-[#07130F] ring-4 ring-[#25C269]/40 scale-110 border-2 border-white'
                        : isHighCongestion
                        ? 'bg-[#07130F] border-2 border-[#F3C45B] text-white'
                        : 'bg-[#07130F] border-2 border-[#25C269] text-white hover:border-white'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                        isHighCongestion ? 'bg-[#F3C45B] text-[#07130F]' : 'bg-[#25C269] text-[#07130F]'
                      }`}
                    >
                      <Fuel className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-[11px] font-black whitespace-nowrap">
                        {st.name.split('—')[0].replace('(Station', '').trim()}
                      </span>
                      <div className="flex items-center gap-1.5 text-[9px]">
                        <span
                          className={`font-mono font-bold px-1 rounded ${
                            isHighCongestion
                              ? 'text-[#F3C45B] bg-[#F3C45B]/20'
                              : 'text-[#25C269] bg-[#25C269]/20'
                          }`}
                        >
                          ~{st.cngQueue.estimatedWaitMinutes}m wait
                        </span>
                        <span className="text-[#F6F1E8]/60">
                          {st.cngQueue.totalVehiclesAhead} ahead
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pulse Ring for selected */}
                {isSelected && (
                  <span className="absolute -inset-2 rounded-full bg-[#25C269]/30 animate-ping -z-10 pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Station Bottom Bar / Quick Preview */}
      {selectedStation ? (
        <div className="p-4 bg-[#031815] border-t border-[#25C269]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#F6F1E8]/70">
              <span className="text-[#25C269] font-bold">{selectedStation.brand}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedStation.city}, {selectedStation.state}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[#F3C45B]">Rating {selectedStation.rating} ★</span>
            </div>
            <h4 className="text-base font-bold text-[#F6F1E8]">{selectedStation.name}</h4>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#F6F1E8]/80">
              {selectedStation.type !== 'CNG' && (
                <span className="text-[#168BDB] font-semibold">
                  ⚡ {selectedStation.chargers.filter((c) => c.status === 'AVAILABLE').length} of{' '}
                  {selectedStation.chargers.length} EV Bays Open
                </span>
              )}
              {selectedStation.type !== 'EV' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#25C269] font-semibold">
                    ⛽ CNG Queue: {selectedStation.cngQueue.totalVehiclesAhead} vehicles (~{selectedStation.cngQueue.estimatedWaitMinutes}m wait)
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[#F6F1E8]/70">
                    Pressure: {selectedStation.dispensers[0]?.currentPressureBar || 205} bar
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[#25C269] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25C269] animate-pulse"></span>
                    Live Refresh Rate: 5s
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => onSelectStation(selectedStation)}
              className="px-4 py-2.5 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <span>Inspect Station Details</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-[#031815] border-t border-[#25C269]/20 text-center text-xs text-[#F6F1E8]/60">
          Click any circular map marker to inspect real-time bay availability, dispenser pressure, and reserve.
        </div>
      )}
    </div>
  );
};
