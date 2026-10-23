import React from 'react';
import { Station, Vehicle, EVChargerBay } from '../types';
import { X, Zap, Fuel, Star, MapPin, Clock, Coffee, Wifi, ShieldCheck, CheckCircle2, AlertTriangle, QrCode, Navigation, Gauge } from 'lucide-react';
import { isChargerCompatible } from '../algorithms/evCompatibility';

interface StationDetailModalProps {
  station: Station;
  vehicle: Vehicle;
  onClose: () => void;
  onOpenEVBooking: (station: Station) => void;
  onOpenCNGBooking: (station: Station) => void;
  onQuickQRCharge: (charger: EVChargerBay) => void;
  onOpenFeedback: (station: Station) => void;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({
  station,
  vehicle,
  onClose,
  onOpenEVBooking,
  onOpenCNGBooking,
  onQuickQRCharge,
  onOpenFeedback,
}) => {
  const isEV = station.type === 'EV' || station.type === 'HYBRID';
  const isCNG = station.type === 'CNG' || station.type === 'HYBRID';

  const availableEVBays = station.chargers.filter((c) => c.status === 'AVAILABLE');
  const avgPressure = station.dispensers[0]?.currentPressureBar || 205;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#062B25] border border-[#28B85B]/30 rounded-2xl shadow-2xl p-6 overflow-hidden my-8 max-h-[90vh] overflow-y-auto text-[#F6F1E8]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#F6F1E8]/60 hover:text-white rounded-lg hover:bg-[#031815] transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Station Header */}
        <div className="space-y-2 mb-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-[#28B85B] uppercase tracking-wider">{station.brand}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#F6F1E8]/60">{station.type} MOBILITY HUB</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 font-mono text-[#F3C45B]">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{station.rating} ({station.totalReviews} reviews)</span>
            </span>
            <span aria-hidden="true">·</span>
            {/* Sensor Status Indicator */}
            <span className="text-[#F6F1E8]/70 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#28B85B]"></span>
              <span>Updated {station.lastSensorUpdateSecondsAgo}s ago</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white">{station.name}</h2>
          <div className="flex items-center gap-2 text-xs text-[#F6F1E8]/70">
            <MapPin className="w-3.5 h-3.5 text-[#28B85B] shrink-0" />
            <span>{station.address}</span>
            {station.highwayCorridor && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#28B85B] font-semibold">{station.highwayCorridor}</span>
              </>
            )}
          </div>
        </div>

        {/* Section 1: Explainable Recommendation Box */}
        <div className="p-4 rounded-xl bg-[#031815] border border-[#28B85B]/30 mb-6 text-xs">
          <span className="text-[#28B85B] uppercase font-bold tracking-wider block mb-1">
            Why Routiq Recommends This Station
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#F6F1E8]/90">
            {isEV && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#28B85B] shrink-0" />
                  <span>Your car is compatible ({vehicle.name})</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#28B85B] shrink-0" />
                  <span>{availableEVBays.length} charging bay(s) available right now</span>
                </div>
              </>
            )}
            {isCNG && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#168BDB] shrink-0" />
                  <span>Optimal compressor line pressure ({avgPressure} bar) — Fast refill</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#168BDB] shrink-0" />
                  <span>Approximately 23 min faster than nearest bottleneck station</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 2: EV Chargers (if applicable) */}
        {isEV && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400 fill-current" />
                <span>EV CHARGING BAYS ({station.chargers.length} TOTAL)</span>
              </h3>
              <span className="text-xs text-slate-400">
                {availableEVBays.length} available now
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {station.chargers.map((ch) => {
                const compat = isChargerCompatible(vehicle, ch);
                const isAvail = ch.status === 'AVAILABLE';

                return (
                  <div
                    key={ch.id}
                    className={`p-3.5 rounded-xl border ${
                      isAvail
                        ? 'border-emerald-500/30 bg-emerald-950/10'
                        : 'border-slate-800 bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white">{ch.bayNumber}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          isAvail
                            ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {ch.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 flex items-center gap-2">
                      <span className="font-semibold text-emerald-300">{ch.maxPowerKW} kW {ch.isDC ? 'DC Fast' : 'AC'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{ch.connectorType}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                      <span className="font-mono">₹{ch.pricePerKWh}/kWh</span>
                      <span>Uptime: {ch.reliabilityScore}%</span>
                    </div>

                    {/* Direct Quick QR if available */}
                    {isAvail && (
                      <button
                        onClick={() => onQuickQRCharge(ch)}
                        className="mt-2.5 w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Direct QR Charge</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 3: CNG Queue & Dispensers (if applicable) */}
        {isCNG && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Fuel className="w-4 h-4 text-cyan-400" />
                <span>CNG TELEMETRY &amp; SEGMENTED QUEUE</span>
              </h3>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-cyan-400 font-bold">Pressure: {avgPressure} bar</span>
                <span className="text-slate-400">Total Ahead: {station.cngQueue.totalVehiclesAhead}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Cars</span>
                <span className="text-base font-bold text-white font-mono">{station.cngQueue.breakdown.cars}</span>
                <span className="text-[10px] text-slate-500 block">~4 min / car</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Autos</span>
                <span className="text-base font-bold text-white font-mono">{station.cngQueue.breakdown.autos}</span>
                <span className="text-[10px] text-slate-500 block">~2.5 min / auto</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Commercial &amp; Taxis</span>
                <span className="text-base font-bold text-white font-mono">
                  {station.cngQueue.breakdown.commercial + station.cngQueue.breakdown.taxis}
                </span>
                <span className="text-[10px] text-slate-500 block">~6 min avg</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Est. Wait</span>
                <span className="text-base font-bold text-cyan-400 font-mono">
                  ~{station.cngQueue.estimatedWaitMinutes} min
                </span>
                <span className="text-[10px] text-slate-500 block">De-congested</span>
              </div>
            </div>

            <div className="mt-2.5 p-2.5 bg-[#031815] rounded-xl border border-[#25C269]/30 flex items-center justify-between text-xs text-[#25C269]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#25C269] animate-pulse" />
                <span className="font-bold">Live Sensor Refresh Rate: 5 seconds</span>
              </div>
              <span className="text-[10px] text-[#F6F1E8]/70 font-mono">
                IoT SCADA Pressure &amp; Line Stream
              </span>
            </div>
          </div>
        )}

        {/* Section 4: Amenities */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-white mb-2">STATION &amp; HOSPITALITY AMENITIES</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {station.amenities.map((am) => (
              <span
                key={am}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5"
              >
                {am === 'Café' && <Coffee className="w-3.5 h-3.5 text-amber-400" />}
                {am.includes('Wi-Fi') && <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{am}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Safety Warning notice */}
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between mb-6">
          <span>Safety Notice: For your safety, use voice guidance or come to a full stop before interacting.</span>
          <button
            onClick={() => onOpenFeedback(station)}
            className="text-emerald-400 hover:text-emerald-300 font-semibold underline shrink-0 ml-2"
          >
            Report Station Issue
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            Close
          </button>

          {isEV && (
            <button
              onClick={() => onOpenEVBooking(station)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-lg"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Reserve EV Bay</span>
            </button>
          )}

          {isCNG && (
            <button
              onClick={() => onOpenCNGBooking(station)}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-lg"
            >
              <Fuel className="w-4 h-4" />
              <span>Get Green Window</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
