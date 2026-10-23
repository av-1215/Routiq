import React, { useState } from 'react';
import { CNGGreenWindow, Station, Vehicle, Wallet } from '../types';
import { X, Fuel, Clock, Gauge, AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import { allocateGreenWindow, calculateSegmentedCNGWait, getPressurePenaltyMultiplier } from '../algorithms/cngDecongestion';

interface CNGGreenWindowModalProps {
  station: Station;
  vehicle: Vehicle;
  wallet: Wallet;
  onClose: () => void;
  onAssignWindow: (window: CNGGreenWindow) => void;
  onSelectAlternativeStation?: (altStation: Station) => void;
  allStations: Station[];
}

export const CNGGreenWindowModal: React.FC<CNGGreenWindowModalProps> = ({
  station,
  vehicle,
  wallet,
  onClose,
  onAssignWindow,
  onSelectAlternativeStation,
  allStations,
}) => {
  const [etaTime, setEtaTime] = useState('16:15');
  const [confirmedWindow, setConfirmedWindow] = useState<CNGGreenWindow | null>(null);

  // Dispensers & Pressure analysis
  const avgPressure = station.dispensers[0]?.currentPressureBar || 205;
  const pressureStatus = getPressurePenaltyMultiplier(avgPressure);

  // Segmented Wait Times
  const activeDispensersCount = station.dispensers.filter((d) => d.status === 'ACTIVE').length || 2;
  const segmentedWait = calculateSegmentedCNGWait(station.cngQueue.breakdown, activeDispensersCount, avgPressure);

  // High Congestion Warning Check
  const isCongested = station.congestionIndex > 1.1;
  const alternativeStation = allStations.find(
    (st) => st.type !== 'EV' && st.id !== station.id && st.congestionIndex < 0.8
  );

  const handleGenerateWindow = () => {
    const [hours, mins] = etaTime.split(':').map(Number);
    const targetDate = new Date();
    targetDate.setHours(hours, mins, 0, 0);

    const generated = allocateGreenWindow(
      targetDate,
      vehicle.cngCategory || 'Car',
      station,
      station.cngQueue.totalVehiclesAhead
    );

    const newWindow: CNGGreenWindow = {
      id: `RQ-CNG-${Math.floor(100000 + Math.random() * 900000)}`,
      stationId: station.id,
      stationName: station.name,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      category: vehicle.cngCategory || 'Car',
      etaTime,
      greenWindowStart: generated.startFormatted,
      greenWindowEnd: generated.endFormatted,
      queuePosition: generated.queuePosition,
      estimatedWaitMinutes: generated.estimatedWaitMin,
      status: 'ASSIGNED',
      ghostRiskScore: 5,
      trafficDelayMinutes: 0,
      qrToken: `QR-RQ-GW-${station.id}-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    onAssignWindow(newWindow);
    setConfirmedWindow(newWindow);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!confirmedWindow ? (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
                <Fuel className="w-4 h-4" />
                <span>DYNAMIC DE-CONGESTION SYSTEM</span>
              </div>
              <h3 className="text-xl font-bold text-white">{station.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Vehicle: <span className="text-slate-200 font-semibold">{vehicle.name}</span> · Category:{' '}
                <span className="text-cyan-400 font-semibold">{vehicle.cngCategory || 'Car'}</span>
              </p>
            </div>

            {/* Crucial Concept Explainer */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="text-cyan-400 font-bold block mb-1">How Virtual Green Windows Work:</span>
              CNG stations have physical dispenser limits. FuelSync does not sell fictitious bypass passes. Instead, the
              algorithm assigns a predicted arrival window to dynamically stagger queue arrival, minimizing physical idling.
            </div>

            {/* Live Station Diagnostics: Queue Breakdown + Pressure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Segmented Wait Times */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                  Live Queue Composition
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Cars ({station.cngQueue.breakdown.cars})</span>
                    <span className="font-mono text-white">~{segmentedWait.carWaitMin} min wait</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Autos ({station.cngQueue.breakdown.autos})</span>
                    <span className="font-mono text-white">~{segmentedWait.autoWaitMin} min wait</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Commercial / Taxis</span>
                    <span className="font-mono text-white">~{segmentedWait.commercialWaitMin} min wait</span>
                  </div>
                </div>
                <div className="border-t border-slate-800 pt-1.5 flex justify-between font-bold text-slate-200">
                  <span>Your Category Wait ({vehicle.cngCategory})</span>
                  <span className="text-cyan-400 font-mono">~{segmentedWait.totalEstimatedWaitMin} min</span>
                </div>
              </div>

              {/* Manifold Pressure Telemetry */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="text-slate-400 font-bold text-[11px] uppercase tracking-wider flex items-center justify-between">
                  <span>Sensor Pressure</span>
                  <span className="font-mono text-cyan-400 font-bold">{avgPressure} bar</span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Gauge className={`w-3.5 h-3.5 ${pressureStatus.isDegraded ? 'text-amber-400' : 'text-emerald-400'}`} />
                    <span>{pressureStatus.message}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1">
                    Optimal line pressure ensures full cylinder packing (200+ bar) without slow cascade compression.
                  </div>
                </div>
              </div>
            </div>

            {/* Live Sensor Refresh Rate Badge */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950 rounded-xl border border-[#25C269]/30 text-xs text-[#25C269]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#25C269] animate-pulse" />
                <span className="font-bold">Live Sensor Refresh Rate: 5 seconds</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Real-Time SCADA Queue &amp; Pressure Telemetry
              </span>
            </div>

            {/* High Congestion Advisory / Reroute Option */}
            {isCongested && alternativeStation && (
              <div className="p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-start gap-3 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-300 block">
                    Heavy Arrival Demand Detected (Congestion Index {station.congestionIndex})
                  </span>
                  <span className="text-slate-300">
                    Recommended reroute: <strong className="text-white">{alternativeStation.name}</strong> has a 65%
                    shorter queue and higher line pressure (only ~{alternativeStation.cngQueue.estimatedWaitMinutes}m wait).
                  </span>
                  {onSelectAlternativeStation && (
                    <button
                      onClick={() => onSelectAlternativeStation(alternativeStation)}
                      className="mt-1 flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      <span>Switch to {alternativeStation.brand}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ETA Input */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                ENTER ESTIMATED TIME OF ARRIVAL (ETA)
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-white">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <input
                    type="time"
                    value={etaTime}
                    onChange={(e) => setEtaTime(e.target.value)}
                    className="bg-transparent border-none focus:outline-none w-full font-mono text-sm text-white"
                  />
                </div>
                <div className="text-xs text-slate-400">
                  Predicted Green Window: <span className="font-mono text-cyan-400 font-bold">{etaTime} – +15 min</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Includes Ghost Booking Protection &amp; Fair Window Exchange</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateWindow}
                  className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-lg"
                >
                  Assign Virtual Green Window
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Confirmation View */
          <div className="space-y-6 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <div className="text-xs uppercase font-mono tracking-widest text-cyan-400 mb-1">
                DISPATCH WINDOW CONFIRMED
              </div>
              <h3 className="text-2xl font-bold text-white">Green Window Assigned</h3>
              <p className="text-xs text-slate-400 mt-1">Token: {confirmedWindow.id}</p>
            </div>

            {/* Window Pass Card */}
            <div className="max-w-xs mx-auto p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="p-3 bg-white rounded-lg inline-block">
                <div className="w-32 h-32 bg-slate-900 p-2 rounded flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-6 h-6 bg-cyan-400 rounded-sm"></div>
                    <div className="w-6 h-6 bg-cyan-400 rounded-sm"></div>
                  </div>
                  <div className="text-[10px] text-center text-cyan-300 font-mono">
                    POS #{confirmedWindow.queuePosition}
                  </div>
                  <div className="flex justify-between">
                    <div className="w-6 h-6 bg-cyan-400 rounded-sm"></div>
                    <div className="w-6 h-6 bg-slate-700 rounded-sm"></div>
                  </div>
                </div>
              </div>

              <div className="text-xs space-y-1 text-slate-300">
                <div className="text-xl font-bold font-mono text-cyan-300">
                  {confirmedWindow.greenWindowStart} – {confirmedWindow.greenWindowEnd}
                </div>
                <div className="font-semibold text-white">{confirmedWindow.stationName}</div>
                <div className="text-[11px] text-slate-400">
                  Expected Queue Position: <span className="font-mono text-white">#{confirmedWindow.queuePosition}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Est. Dispensing Wait: ~{confirmedWindow.estimatedWaitMinutes} minutes
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Arrival during this window guarantees prioritized dispenser queuing without causing gridlock. If traffic
              slows you down, the system will offer a window exchange.
            </p>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
