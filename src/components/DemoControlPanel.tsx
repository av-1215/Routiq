import React, { useState } from 'react';
import {
  Sliders,
  RefreshCw,
  Zap,
  Fuel,
  AlertTriangle,
  ArrowRight,
  X,
  Activity,
  Cpu,
  Radio,
  CheckCircle2,
  Building2,
  Layers
} from 'lucide-react';
import { Station } from '../types';

interface DemoControlPanelProps {
  onToggleBayState: () => void;
  onToggleQueueSpike: () => void;
  onTriggerTrafficDelay: () => void;
  onToggleSensorHealth: () => void;
  onInjectCommunityReport: () => void;
  onResetDemo: () => void;
  onOpenOperatorDashboard: () => void;
  isSensorHealthy: boolean;
  stations: Station[];
}

export const DemoControlPanel: React.FC<DemoControlPanelProps> = ({
  onToggleBayState,
  onToggleQueueSpike,
  onTriggerTrafficDelay,
  onToggleSensorHealth,
  onInjectCommunityReport,
  onResetDemo,
  onOpenOperatorDashboard,
  isSensorHealthy,
  stations,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'CONTROLS' | 'PIPELINE'>('CONTROLS');

  const stA = stations.find((s) => s.id === 'st-hyd-bhagyanagar-madhapur') || stations[0];
  const stB = stations.find((s) => s.id === 'st-hyd-jiocng-gachibowli') || stations[1];

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex items-center gap-2">
        <button
          onClick={onOpenOperatorDashboard}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#031815] text-[#F6F1E8] border border-[#25C269]/30 hover:border-[#25C269] shadow-xl text-xs font-bold transition-all hover:scale-105"
          title="Open Station Operator Portal"
        >
          <Building2 className="w-3.5 h-3.5 text-[#25C269]" />
          <span>Operator View</span>
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#07130F] text-[#25C269] border border-[#25C269]/40 hover:border-[#25C269] shadow-xl text-xs font-bold transition-all hover:scale-105"
        >
          <Sliders className="w-3.5 h-3.5 animate-pulse" />
          <span>Demo &amp; Mechatronics</span>
        </button>
      </div>

      {/* Floating Panel Drawer */}
      {isOpen && (
        <div className="fixed bottom-32 md:bottom-16 right-4 z-50 w-84 sm:w-96 bg-[#07130F] border-2 border-[#25C269]/50 rounded-3xl shadow-2xl p-5 text-xs text-[#F6F1E8] space-y-4 backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between border-b border-[#25C269]/20 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#25C269]" />
              <span className="font-extrabold text-sm tracking-tight text-white">
                Presenter &amp; Mechatronics Control
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#F6F1E8]/50 hover:text-white rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-tabs: Live Simulation vs Architecture Pipeline */}
          <div className="flex p-1 bg-[#031815] rounded-xl border border-[#062B25] text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('CONTROLS')}
              className={`flex-1 py-1 rounded-lg text-center transition-colors ${
                activeTab === 'CONTROLS' ? 'bg-[#25C269] text-[#07130F]' : 'text-[#F6F1E8]/70 hover:text-white'
              }`}
            >
              Live Telemetry Toggles
            </button>
            <button
              onClick={() => setActiveTab('PIPELINE')}
              className={`flex-1 py-1 rounded-lg text-center transition-colors ${
                activeTab === 'PIPELINE' ? 'bg-[#25C269] text-[#07130F]' : 'text-[#F6F1E8]/70 hover:text-white'
              }`}
            >
              Sensor Pipeline
            </button>
          </div>

          {activeTab === 'CONTROLS' ? (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {/* Toggle 1: 150kW Bay State */}
              <div className="p-3 bg-[#031815] rounded-xl border border-[#062B25] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#168BDB]" />
                    <span>EV Charger Bay 03</span>
                  </div>
                  <div className="text-[10px] text-[#F6F1E8]/60 mt-0.5">
                    Gachibowli 150kW Fast Bay
                  </div>
                </div>
                <button
                  onClick={onToggleBayState}
                  className="px-2.5 py-1.5 bg-[#168BDB]/20 hover:bg-[#168BDB]/30 text-[#168BDB] font-bold rounded-lg border border-[#168BDB]/40 text-[11px] transition-colors"
                >
                  Free / Occupy
                </button>
              </div>

              {/* Toggle 2: CNG Queue Surge */}
              <div className="p-3 bg-[#031815] rounded-xl border border-[#062B25] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Fuel className="w-3.5 h-3.5 text-[#25C269]" />
                    <span>CNG Queue Surge</span>
                  </div>
                  <div className="text-[10px] text-[#F6F1E8]/60 mt-0.5">
                    Madhapur ({stA?.cngQueue.estimatedWaitMinutes}m wait)
                  </div>
                </div>
                <button
                  onClick={onToggleQueueSpike}
                  className="px-2.5 py-1.5 bg-[#25C269]/20 hover:bg-[#25C269]/30 text-[#25C269] font-bold rounded-lg border border-[#25C269]/40 text-[11px] transition-colors"
                >
                  5m ↔ 35m
                </button>
              </div>

              {/* Toggle 3: Sensor Telemetry Health */}
              <div className="p-3 bg-[#031815] rounded-xl border border-[#062B25] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#25C269]" />
                    <span>Sensor Telemetry Link</span>
                  </div>
                  <div className="text-[10px] text-[#F6F1E8]/60 mt-0.5">
                    Status: {isSensorHealthy ? '🟢 Online (99.4% confidence)' : '🔴 Offline / Stale Fallback'}
                  </div>
                </div>
                <button
                  onClick={onToggleSensorHealth}
                  className={`px-2.5 py-1.5 font-bold rounded-lg border text-[11px] transition-colors ${
                    isSensorHealthy
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : 'bg-[#25C269]/20 text-[#25C269] border-[#25C269]/40'
                  }`}
                >
                  {isSensorHealthy ? 'Kill Link' : 'Restore Link'}
                </button>
              </div>

              {/* Toggle 4: Traffic Congestion Anomaly */}
              <div className="p-3 bg-[#031815] rounded-xl border border-[#062B25] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>ORR Corridor Delay</span>
                  </div>
                  <div className="text-[10px] text-[#F6F1E8]/60 mt-0.5">
                    Inject +14m delay &amp; Reroute
                  </div>
                </div>
                <button
                  onClick={onTriggerTrafficDelay}
                  className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold rounded-lg border border-amber-500/40 text-[11px] transition-colors"
                >
                  Inject Anomaly
                </button>
              </div>

              {/* Toggle 5: Inject Verified Community Report */}
              <div className="p-3 bg-[#031815] rounded-xl border border-[#062B25] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#25C269]" />
                    <span>Community Report</span>
                  </div>
                  <div className="text-[10px] text-[#F6F1E8]/60 mt-0.5">
                    Crowdsourced queue validation
                  </div>
                </div>
                <button
                  onClick={onInjectCommunityReport}
                  className="px-2.5 py-1.5 bg-[#25C269]/20 hover:bg-[#25C269]/30 text-[#25C269] font-bold rounded-lg border border-[#25C269]/40 text-[11px] transition-colors"
                >
                  Inject Report
                </button>
              </div>
            </div>
          ) : (
            /* SENSOR PIPELINE ARCHITECTURE (Section 19 in specification) */
            <div className="p-3.5 bg-[#031815] rounded-xl border border-[#062B25] space-y-2.5 text-[11px]">
              <span className="font-extrabold text-white block uppercase tracking-wider text-[10px]">
                Mechatronics &amp; Telemetry Pipeline
              </span>

              <div className="space-y-1.5 text-[#F6F1E8]/80">
                <div className="flex items-center gap-2 p-1.5 bg-[#07130F] rounded-lg border border-[#062B25]">
                  <span className="w-5 h-5 rounded-full bg-[#25C269]/20 text-[#25C269] flex items-center justify-center font-bold text-[10px]">1</span>
                  <span><strong>Physical Sensors:</strong> Optical bay occupancy, Hall-effect current relay, SCADA line pressure</span>
                </div>
                <div className="text-center text-[#25C269] font-mono leading-none">↓</div>
                <div className="flex items-center gap-2 p-1.5 bg-[#07130F] rounded-lg border border-[#062B25]">
                  <span className="w-5 h-5 rounded-full bg-[#168BDB]/20 text-[#168BDB] flex items-center justify-center font-bold text-[10px]">2</span>
                  <span><strong>Edge Device:</strong> ESP32 / Industrial PLC running secure MQTT &amp; OCPI 2.2 telemetry</span>
                </div>
                <div className="text-center text-[#25C269] font-mono leading-none">↓</div>
                <div className="flex items-center gap-2 p-1.5 bg-[#07130F] rounded-lg border border-[#062B25]">
                  <span className="w-5 h-5 rounded-full bg-[#25C269]/20 text-[#25C269] flex items-center justify-center font-bold text-[10px]">3</span>
                  <span><strong>Validation Layer:</strong> Timestamps, schema checksums, confidence scoring &amp; stale-guard</span>
                </div>
                <div className="text-center text-[#25C269] font-mono leading-none">↓</div>
                <div className="flex items-center gap-2 p-1.5 bg-[#07130F] rounded-lg border border-[#062B25]">
                  <span className="w-5 h-5 rounded-full bg-[#25C269] text-[#07130F] flex items-center justify-center font-bold text-[10px]">4</span>
                  <span><strong>Routiq Intelligence &amp; TRIPP:</strong> Real-time journey recalculation &amp; mobile UI</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-[#25C269]/20 flex items-center justify-between">
            <button
              onClick={onOpenOperatorDashboard}
              className="text-[#25C269] font-bold text-[11px] hover:underline"
            >
              Open Operator Dashboard
            </button>
            <button
              onClick={onResetDemo}
              className="flex items-center gap-1 text-[11px] text-[#F6F1E8]/60 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset State</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
