import React, { useState } from 'react';
import { Station, Vehicle } from '../types';
import {
  Navigation,
  ArrowRight,
  Zap,
  Fuel,
  Volume2,
  VolumeX,
  X,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  MapPin,
  Clock,
  Battery
} from 'lucide-react';

interface ActiveJourneyOverlayProps {
  vehicle: Vehicle;
  destination: string;
  nextStopName?: string;
  distanceKm?: number;
  etaMinutes?: number;
  onExitJourney: () => void;
  onCheckInAtBay?: () => void;
}

export const ActiveJourneyOverlay: React.FC<ActiveJourneyOverlayProps> = ({
  vehicle,
  destination,
  nextStopName = 'Jio-bp pulse (Gachibowli ORR)',
  distanceKm = 18.4,
  etaMinutes = 26,
  onExitJourney,
  onCheckInAtBay,
}) => {
  const [muted, setMuted] = useState(false);
  const [drivingStep, setDrivingStep] = useState<1 | 2 | 3>(1);

  return (
    <div className="fixed inset-0 z-50 bg-[#07130F] text-[#F6F1E8] flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200">
      {/* Top Driving HUD Bar */}
      <div className="flex items-center justify-between bg-[#031815] border border-[#25C269]/40 rounded-2xl px-5 py-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#25C269] text-[#07130F] flex items-center justify-center font-black">
            <Navigation className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-[#25C269] uppercase tracking-wider block">
              Active Driving Guidance Mode
            </span>
            <h2 className="text-sm sm:text-base font-extrabold text-white truncate max-w-xs sm:max-w-md">
              {destination}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMuted(!muted)}
            className="p-2.5 rounded-xl bg-[#07130F] border border-[#062B25] text-[#F6F1E8]/70 hover:text-white transition-colors"
            title={muted ? 'Unmute Audio Guidance' : 'Mute Voice Alerts'}
          >
            {muted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-[#25C269]" />}
          </button>

          <button
            onClick={onExitJourney}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#07130F] hover:bg-red-500/15 border border-[#062B25] hover:border-red-500/40 text-xs font-bold text-white rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
            <span>End Trip</span>
          </button>
        </div>
      </div>

      {/* Center: Simplified High-Contrast Turn Instruction */}
      <div className="max-w-xl mx-auto w-full my-auto space-y-6 text-center">
        {drivingStep === 1 && (
          <div className="bg-[#031815] border-2 border-[#25C269] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-4">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#25C269]/20 text-[#25C269] uppercase tracking-wider">
              Next Action · In 700 metres
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              Take Exit 19
            </div>
            <p className="text-lg font-semibold text-[#25C269]">
              Outer Ring Road (ORR) towards Gachibowli Junction
            </p>

            <div className="pt-4 border-t border-[#062B25] flex items-center justify-around text-xs text-[#F6F1E8]/70">
              <div>
                <span className="text-[#F6F1E8]/50 text-[10px] block">ETA</span>
                <span className="text-xl font-bold font-mono text-white">~{etaMinutes} min</span>
              </div>
              <div className="w-px h-8 bg-[#062B25]" />
              <div>
                <span className="text-[#F6F1E8]/50 text-[10px] block">Remaining</span>
                <span className="text-xl font-bold font-mono text-white">{distanceKm} km</span>
              </div>
              <div className="w-px h-8 bg-[#062B25]" />
              <div>
                <span className="text-[#F6F1E8]/50 text-[10px] block">Safe Reserve</span>
                <span className="text-xl font-bold font-mono text-[#25C269]">42% Safe</span>
              </div>
            </div>
          </div>
        )}

        {drivingStep === 2 && (
          <div className="bg-[#031815] border-2 border-[#168BDB] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-4">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#168BDB]/20 text-[#168BDB] uppercase tracking-wider">
              Reserved Stop Ahead · 300m
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white">
              {nextStopName}
            </div>
            <p className="text-base font-semibold text-[#168BDB]">
              Turn Left into Jio-bp EV &amp; Clean Fuels Plaza
            </p>
            <div className="p-3 bg-[#07130F] rounded-xl border border-[#062B25] text-xs font-mono text-[#25C269]">
              Bay 01 Reserved · Contactor Ready · PIN: 8492
            </div>
          </div>
        )}

        {drivingStep === 3 && (
          <div className="bg-[#031815] border-2 border-[#25C269] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-4">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#25C269]/20 text-[#25C269] uppercase tracking-wider">
              Arrived at Station
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white">
              Check in at Bay 01
            </div>
            <p className="text-sm text-[#F6F1E8]/70">
              Position vehicle at 150kW CCS2 Dispenser. Optical contactor QR scanner active.
            </p>
            <button
              onClick={() => {
                onCheckInAtBay?.();
                onExitJourney();
              }}
              className="w-full py-4 bg-[#25C269] text-[#07130F] font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              <span>Tap to Release Contactor (PIN 8492)</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Large Controls (Voice-compatible & Minimal Distraction) */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between gap-4 pt-2">
        <button
          onClick={() => setDrivingStep(drivingStep === 1 ? 2 : drivingStep === 2 ? 3 : 1)}
          className="flex-1 py-3.5 bg-[#031815] hover:bg-[#062B25] border border-[#25C269]/40 rounded-2xl text-xs font-extrabold text-[#25C269] transition-colors"
        >
          {drivingStep === 1 ? 'Simulate Approach (+500m)' : drivingStep === 2 ? 'Simulate Arrival at Bay' : 'Reset HUD'}
        </button>

        <button
          onClick={onExitJourney}
          className="px-6 py-3.5 bg-[#031815] hover:bg-red-500/20 text-[#F6F1E8]/80 hover:text-red-300 border border-[#062B25] rounded-2xl text-xs font-bold transition-colors"
        >
          Exit Guidance
        </button>
      </div>
    </div>
  );
};
