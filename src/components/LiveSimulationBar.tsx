import React from 'react';
import { Activity, Play, Pause, AlertTriangle, RefreshCw, Sparkles, Zap, Gauge } from 'lucide-react';

interface LiveSimulationBarProps {
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onTriggerTrafficDelay: () => void;
  onTriggerBayFreed: () => void;
  onTriggerPressureDrop: () => void;
  lastSimEventMessage: string | null;
}

export const LiveSimulationBar: React.FC<LiveSimulationBarProps> = ({
  isSimulating,
  onToggleSimulation,
  onTriggerTrafficDelay,
  onTriggerBayFreed,
  onTriggerPressureDrop,
  lastSimEventMessage,
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs py-2 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Simulation Status & Live Ticker */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              isSimulating
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {isSimulating ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
            <span>Simulation: {isSimulating ? 'LIVE TICKING' : 'PAUSED'}</span>
          </button>

          {lastSimEventMessage ? (
            <span className="text-slate-300 font-mono text-[11px] truncate max-w-xs sm:max-w-md">
              {lastSimEventMessage}
            </span>
          ) : (
            <span className="text-slate-500 text-[11px] hidden sm:inline">
              Simulating Indian CPO OCPI streams &amp; SCADA CNG compressor feeds.
            </span>
          )}
        </div>

        {/* Right: Quick Scenario Injections */}
        <div className="flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 hidden md:inline">Inject Event:</span>

          <button
            onClick={onTriggerTrafficDelay}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700 whitespace-nowrap transition-colors"
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Simulate +14m Traffic Jam</span>
          </button>

          <button
            onClick={onTriggerBayFreed}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-slate-700 whitespace-nowrap transition-colors"
          >
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>Free 120kW Bay</span>
          </button>

          <button
            onClick={onTriggerPressureDrop}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 whitespace-nowrap transition-colors"
          >
            <Gauge className="w-3 h-3 text-cyan-400" />
            <span>Drop Manifold Pressure</span>
          </button>
        </div>
      </div>
    </div>
  );
};
