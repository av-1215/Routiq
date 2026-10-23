import React, { useState } from 'react';
import { Station, Vehicle, EVReservation, CNGGreenWindow } from '../types';
import {
  Search,
  Zap,
  Fuel,
  Compass,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  TrendingDown,
  Navigation,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { HYDERABAD_DEMO_DESTINATIONS } from '../data/mockDatabase';
import { EVModeDashboard } from './EVModeDashboard';
import { CNGModeDashboard } from './CNGModeDashboard';

interface HeroLandingProps {
  onSelectMode: (mode: 'explore-ev' | 'explore-cng' | 'tripp' | 'bookings' | 'explore' | 'community') => void;
  onLaunchDemoScenario: () => void;
  activeVehicle: Vehicle;
  onSelectVehicle: (v: Vehicle) => void;
  vehicles: Vehicle[];
  stations: Station[];
  onSelectStation: (st: Station) => void;
  activeReservation?: EVReservation;
  activeCngWindow?: CNGGreenWindow;
  onPlanDestination?: (dest: string) => void;
  onStartActiveJourney?: () => void;
  userDrivePreference?: 'EV' | 'CNG' | 'BOTH';
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  onSelectMode,
  onLaunchDemoScenario,
  activeVehicle,
  onSelectVehicle,
  vehicles,
  stations,
  onSelectStation,
  activeReservation,
  activeCngWindow,
  onPlanDestination,
  onStartActiveJourney,
  userDrivePreference = 'BOTH',
}) => {
  // Determine default mode based on vehicle & preference
  const defaultHomeMode =
    activeVehicle.type === 'EV' || userDrivePreference === 'EV'
      ? 'EV'
      : activeVehicle.type === 'CNG' || userDrivePreference === 'CNG'
      ? 'CNG'
      : 'OVERVIEW';

  const [homeMode, setHomeMode] = useState<'OVERVIEW' | 'EV' | 'CNG'>(defaultHomeMode);
  const [destinationSearch, setDestinationSearch] = useState('');

  // Top recommendation station (Jio-bp Gachibowli)
  const recommendedStation =
    stations.find((s) => s.id === 'st-hyd-jiocng-gachibowli') || stations[1];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destinationSearch.trim()) {
      if (onPlanDestination) {
        onPlanDestination(destinationSearch.trim());
      } else {
        onSelectMode('tripp');
      }
    } else {
      onSelectMode('tripp');
    }
  };

  const isEV = activeVehicle.type === 'EV' || userDrivePreference === 'EV';
  const isCNG = activeVehicle.type === 'CNG' || userDrivePreference === 'CNG';
  const isBoth = userDrivePreference === 'BOTH';

  return (
    <div className="space-y-6 pt-1 sm:pt-2">
      {/* Top Experience Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#07130F] p-3 rounded-2xl border border-[#25C269]/20 shadow-lg">
        <div className="flex items-center gap-2.5">
          <img
            src="/routiq_logo.png"
            alt="Routiq Logo"
            className="w-8 h-8 rounded-xl object-contain bg-[#031815] p-1 border border-[#25C269]/40 shadow-sm shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base leading-none">Routiq</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#25C269]/15 text-[#25C269] font-bold">
                {activeVehicle.name}
              </span>
            </div>
            <span className="text-[10px] text-[#25C269] font-medium leading-none">
              Smarter Routes. Greener Journeys.
            </span>
          </div>
        </div>

        {/* 3 Clear Choices: EV Mode | CNG Mode | Simplified Overview */}
        <div className="flex p-1 bg-[#031815] rounded-xl border border-[#062B25] self-start sm:self-auto">
          <button
            onClick={() => {
              setHomeMode('EV');
              // Auto-select EV vehicle if available
              const evVeh = vehicles.find((v) => v.type === 'EV');
              if (evVeh && activeVehicle.type !== 'EV') onSelectVehicle(evVeh);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              homeMode === 'EV'
                ? 'bg-[#168BDB] text-white shadow'
                : 'text-[#F6F1E8]/70 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>⚡ EV Mode</span>
          </button>

          <button
            onClick={() => {
              setHomeMode('CNG');
              // Auto-select CNG vehicle if available
              const cngVeh = vehicles.find((v) => v.type === 'CNG');
              if (cngVeh && activeVehicle.type !== 'CNG') onSelectVehicle(cngVeh);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              homeMode === 'CNG'
                ? 'bg-[#25C269] text-[#07130F] shadow'
                : 'text-[#F6F1E8]/70 hover:text-white'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>⛽ CNG Mode</span>
          </button>

          <button
            onClick={() => setHomeMode('OVERVIEW')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              homeMode === 'OVERVIEW'
                ? 'bg-[#062B25] text-white border border-[#25C269]/40 shadow'
                : 'text-[#F6F1E8]/70 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
        </div>
      </div>

      {/* RENDER MODE 1: EV DEDICATED DASHBOARD */}
      {homeMode === 'EV' && (
        <EVModeDashboard
          activeVehicle={activeVehicle.type === 'EV' ? activeVehicle : vehicles.find((v) => v.type === 'EV') || activeVehicle}
          stations={stations}
          onSelectStation={onSelectStation}
          onReserveBay={(st) => {
            onSelectStation(st);
            onSelectMode('bookings');
          }}
          onNavigateToPlan={(dest) => {
            if (onPlanDestination) onPlanDestination(dest);
            else onSelectMode('tripp');
          }}
        />
      )}

      {/* RENDER MODE 2: CNG DEDICATED DASHBOARD */}
      {homeMode === 'CNG' && (
        <CNGModeDashboard
          activeVehicle={activeVehicle.type === 'CNG' ? activeVehicle : vehicles.find((v) => v.type === 'CNG') || activeVehicle}
          stations={stations}
          onSelectStation={onSelectStation}
          onAssignGreenWindow={(st) => {
            onSelectStation(st);
            onSelectMode('bookings');
          }}
          onNavigateToPlan={(dest) => {
            if (onPlanDestination) onPlanDestination(dest);
            else onSelectMode('tripp');
          }}
          onTriggerSimulatedQueueSurge={onLaunchDemoScenario}
        />
      )}

      {/* RENDER MODE 3: SIMPLE BY DEFAULT OVERVIEW */}
      {homeMode === 'OVERVIEW' && (
        <div className="max-w-2xl mx-auto space-y-6 pt-2">
          {/* Main Question: Where are you going? */}
          <div className="bg-[#031815] border-2 border-[#25C269]/30 focus-within:border-[#25C269] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 transition-colors">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#F6F1E8]/70 block">
              Where are you going?
            </label>

            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="flex items-center gap-3 p-3.5 sm:p-4 bg-[#07130F] rounded-2xl border border-[#062B25] shadow-inner">
                <Search className="w-5 h-5 text-[#25C269] shrink-0" />
                <input
                  type="text"
                  value={destinationSearch}
                  onChange={(e) => setDestinationSearch(e.target.value)}
                  placeholder="Enter destination (e.g. RGIA Airport, Financial District...)"
                  className="w-full bg-transparent text-white placeholder-[#F6F1E8]/40 text-sm sm:text-base focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-black text-xs sm:text-sm rounded-xl whitespace-nowrap transition-colors shadow-sm flex items-center gap-1"
                >
                  <span>Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Quick popular destinations */}
            <div className="flex items-center gap-2 overflow-x-auto text-xs pt-1">
              <span className="text-[#F6F1E8]/40 text-[11px] shrink-0">Popular:</span>
              {HYDERABAD_DEMO_DESTINATIONS.slice(0, 3).map((dest) => (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => {
                    setDestinationSearch(dest.name);
                    if (onPlanDestination) onPlanDestination(dest.name);
                    else onSelectMode('tripp');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#07130F] hover:bg-[#062B25] text-[#F6F1E8]/70 hover:text-[#25C269] border border-[#062B25] whitespace-nowrap text-[11px] transition-colors"
                >
                  {dest.name.split('(')[0].trim()} ({dest.distanceKm} km)
                </button>
              ))}
            </div>
          </div>

          {/* Primary & Secondary Actions */}
          <div className="space-y-3">
            {/* If user drives EV or Both */}
            {(isEV || isBoth) && (
              <button
                onClick={() => onSelectMode('explore-ev')}
                className="w-full p-5 bg-[#031815] hover:bg-[#062B25] border-2 border-[#168BDB]/40 hover:border-[#168BDB] rounded-3xl text-left transition-all shadow-lg flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#168BDB]/20 text-[#168BDB] flex items-center justify-center font-bold">
                    <Zap className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <span className="text-base font-extrabold text-white block group-hover:text-[#168BDB] transition-colors">
                      Find a charger
                    </span>
                    <span className="text-xs text-[#F6F1E8]/60 mt-0.5 block">
                      Compatible with {activeVehicle.name} · 18 fast bays free nearby
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[#168BDB] group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {/* If user drives CNG or Both */}
            {(isCNG || isBoth) && (
              <button
                onClick={() => onSelectMode('explore-cng')}
                className="w-full p-5 bg-[#031815] hover:bg-[#062B25] border-2 border-[#25C269]/40 hover:border-[#25C269] rounded-3xl text-left transition-all shadow-lg flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#25C269]/20 text-[#25C269] flex items-center justify-center font-bold">
                    <Fuel className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-base font-extrabold text-white block group-hover:text-[#25C269] transition-colors">
                      Find CNG
                    </span>
                    <span className="text-xs text-[#F6F1E8]/60 mt-0.5 block">
                      Live queue intelligence · Save up to 23 mins waiting time
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[#25C269] group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {/* Secondary Action: Plan with TRIPP */}
            <button
              onClick={() => onSelectMode('tripp')}
              className="w-full p-4 bg-[#07130F] hover:bg-[#031815] border border-[#25C269]/30 hover:border-[#25C269] rounded-2xl text-left transition-all flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#25C269]/15 text-[#25C269] flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-white block">
                    Plan with TRIPP
                  </span>
                  <span className="text-[11px] text-[#F6F1E8]/50 block">
                    Intelligent traffic-aware corridor optimizer
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#25C269]" />
            </button>
          </div>

          {/* Active Booking Summary */}
          {(activeReservation || activeCngWindow) && (
            <div className="p-4 bg-[#031815] border-2 border-[#25C269] rounded-3xl shadow-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#25C269] animate-ping shrink-0" />
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#25C269] block">
                    Next Booking · In Progress
                  </span>
                  <div className="font-extrabold text-white text-xs sm:text-sm mt-0.5">
                    {activeReservation
                      ? `${activeReservation.bayNumber} · ${activeReservation.stationName.split('—')[0].trim()}`
                      : `CNG Virtual Queue #${activeCngWindow?.queuePosition} · ~${activeCngWindow?.estimatedWaitMinutes}m wait`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onStartActiveJourney && (
                  <button
                    onClick={onStartActiveJourney}
                    className="px-3.5 py-1.5 bg-[#25C269] text-[#07130F] font-black text-xs rounded-xl shadow flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Drive</span>
                  </button>
                )}
                <button
                  onClick={() => onSelectMode('bookings')}
                  className="p-1.5 rounded-xl bg-[#07130F] text-[#F6F1E8]/70 hover:text-white border border-[#062B25]"
                  title="View Digital Pass"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Single Routiq Smart Recommendation Summary */}
          <div
            onClick={() => onSelectStation(recommendedStation)}
            className="p-5 bg-[#031815] border border-[#25C269]/30 hover:border-[#25C269] rounded-3xl shadow-xl space-y-2 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[#25C269] font-extrabold">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Routiq recommends</span>
              </div>
              <span className="font-mono text-[11px] text-[#25C269] font-bold">
                Saves ~23 min overall
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-white text-sm group-hover:text-[#25C269] transition-colors">
                  {recommendedStation.name.split('—')[0].trim()}
                </h4>
                <p className="text-xs text-[#F6F1E8]/60 mt-0.5">
                  Available now · 2.1 km away · 7 min wait vs 35 min at nearest
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#25C269] group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
