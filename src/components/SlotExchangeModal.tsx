import React, { useState } from 'react';
import { CNGGreenWindow, EVReservation, Station } from '../types';
import { X, RefreshCw, Users, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { validateSlotExchange } from '../algorithms/cngDecongestion';

interface SlotExchangeModalProps {
  onClose: () => void;
  activeWindow: CNGGreenWindow;
  station: Station;
  onExchangeConfirmed: (updatedWindow: CNGGreenWindow) => void;
}

export const SlotExchangeModal: React.FC<SlotExchangeModalProps> = ({
  onClose,
  activeWindow,
  station,
  onExchangeConfirmed,
}) => {
  // Simulated available peer windows that are willing to swap
  const peerWindows: CNGGreenWindow[] = [
    {
      id: 'RQ-CNG-882194',
      stationId: station.id,
      stationName: station.name,
      vehicleId: 'v-peer-1',
      vehicleName: 'Maruti Dzire CNG (DL 1C 9012)',
      category: 'Taxi',
      etaTime: '16:45',
      greenWindowStart: '16:40',
      greenWindowEnd: '16:55',
      queuePosition: activeWindow.queuePosition + 3,
      estimatedWaitMinutes: 8,
      status: 'ASSIGNED',
      ghostRiskScore: 0,
      trafficDelayMinutes: 0,
      qrToken: 'QR-PEER-1',
      createdAt: '15:30',
    },
    {
      id: 'RQ-CNG-882195',
      stationId: station.id,
      stationName: station.name,
      vehicleId: 'v-peer-2',
      vehicleName: 'Tata Tiago iCNG (HR 26 1120)',
      category: 'Car',
      etaTime: '17:00',
      greenWindowStart: '16:55',
      greenWindowEnd: '17:10',
      queuePosition: activeWindow.queuePosition + 6,
      estimatedWaitMinutes: 10,
      status: 'ASSIGNED',
      ghostRiskScore: 0,
      trafficDelayMinutes: 0,
      qrToken: 'QR-PEER-2',
      createdAt: '15:35',
    },
  ];

  const [selectedPeer, setSelectedPeer] = useState<CNGGreenWindow | null>(peerWindows[0]);
  const [exchangeCompleted, setExchangeCompleted] = useState(false);

  const handleConfirmExchange = () => {
    if (!selectedPeer) return;

    const validation = validateSlotExchange(activeWindow, selectedPeer, station);
    if (!validation.isValid) {
      alert(validation.reason);
      return;
    }

    const updated: CNGGreenWindow = {
      ...activeWindow,
      greenWindowStart: selectedPeer.greenWindowStart,
      greenWindowEnd: selectedPeer.greenWindowEnd,
      etaTime: selectedPeer.etaTime,
      queuePosition: selectedPeer.queuePosition,
      status: 'EXCHANGED',
    };

    setExchangeCompleted(true);
    setTimeout(() => {
      onExchangeConfirmed(updated);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
              <RefreshCw className="w-4 h-4" />
              <span>PEER-TO-PEER GREEN WINDOW EXCHANGE</span>
            </div>
            <h3 className="text-xl font-bold text-white">Delayed by Traffic? Swap Slots</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly zero resale / non-speculative. Preserves physical dispenser equilibrium.
            </p>
          </div>

          {/* Current User Window Box */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="text-[11px] text-slate-500 font-bold uppercase">Your Current Window</span>
            <div className="flex justify-between items-center">
              <span className="font-mono text-base font-bold text-cyan-300">
                {activeWindow.greenWindowStart} – {activeWindow.greenWindowEnd}
              </span>
              <span className="text-slate-400 font-mono">Pos #{activeWindow.queuePosition}</span>
            </div>
            <div className="text-[11px] text-slate-400">Station: {activeWindow.stationName}</div>
          </div>

          {/* Peer Windows Available */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 block">
              Consented Drivers Willing to Swap (+15m to +45m later):
            </span>

            <div className="space-y-2">
              {peerWindows.map((peer) => {
                const isSelected = selectedPeer?.id === peer.id;
                return (
                  <div
                    key={peer.id}
                    onClick={() => setSelectedPeer(peer)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/20'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm font-bold text-white">
                        {peer.greenWindowStart} – {peer.greenWindowEnd}
                      </span>
                      <span className="text-emerald-400 text-[11px] font-semibold">Consent Verified</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>{peer.vehicleName}</span>
                      <span className="font-mono">Queue #{peer.queuePosition}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Policy Guard Notice */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              FuelSync Algorithm Invariant: Swapping window positions does not add to total station congestion. No fees or price premiums are permitted.
            </span>
          </div>

          {/* Action */}
          <div className="pt-2">
            {exchangeCompleted ? (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500 text-emerald-300 rounded-lg text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Exchange Confirmed! Your new window is {selectedPeer?.greenWindowStart} – {selectedPeer?.greenWindowEnd}.</span>
              </div>
            ) : (
              <button
                onClick={handleConfirmExchange}
                className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-lg"
              >
                Confirm Mutual Window Exchange
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
