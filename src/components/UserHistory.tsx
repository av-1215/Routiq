import React, { useState } from 'react';
import { EVReservation, CNGGreenWindow } from '../types';
import { Zap, Fuel, Compass, Clock, CheckCircle2, FileText, ArrowRight, AlertTriangle, ShieldCheck, QrCode } from 'lucide-react';

interface UserHistoryProps {
  evReservations: EVReservation[];
  cngWindows: CNGGreenWindow[];
  onOpenSlotExchange?: (window: CNGGreenWindow) => void;
  onViewPass?: (reservation: EVReservation) => void;
}

export const UserHistory: React.FC<UserHistoryProps> = ({
  evReservations,
  cngWindows,
  onOpenSlotExchange,
  onViewPass,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'EV' | 'CNG'>('ALL');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#28B85B]/20 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F6F1E8]">My Bookings &amp; Active Passes</h2>
          <p className="text-xs text-[#F6F1E8]/70">
            Real-time status for reserved physical EV charging bays, CNG Virtual Green Windows, and anti-overstay tracking.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-[11px] px-2.5 py-1 rounded bg-[#062B25] text-[#28B85B] border border-[#28B85B]/30 font-bold">
            {evReservations.length + cngWindows.length} Active Records
          </span>
        </div>
      </div>

      {/* Aggregate Analytics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#062B25]/60 rounded-xl border border-[#28B85B]/20 text-xs">
        <div>
          <span className="text-[#F6F1E8]/60 block text-[11px]">Total EV Energy Intake</span>
          <span className="text-lg font-bold font-mono text-[#F6F1E8]">184.2 kWh</span>
          <span className="text-[10px] text-[#28B85B] block mt-0.5">₹18.4 avg / kWh</span>
        </div>
        <div>
          <span className="text-[#F6F1E8]/60 block text-[11px]">Total CNG Dispensed</span>
          <span className="text-lg font-bold font-mono text-[#F6F1E8]">42.8 kg</span>
          <span className="text-[10px] text-[#168BDB] block mt-0.5">₹88.5 avg / kg</span>
        </div>
        <div>
          <span className="text-[#F6F1E8]/60 block text-[11px]">Corridor Queue Avoided</span>
          <span className="text-lg font-bold font-mono text-[#28B85B]">76 minutes</span>
          <span className="text-[10px] text-[#F6F1E8]/50 block mt-0.5">Via Green Windows</span>
        </div>
        <div>
          <span className="text-[#F6F1E8]/60 block text-[11px]">Hardware Reservation Rate</span>
          <span className="text-lg font-bold font-mono text-[#28B85B]">100% Guaranteed</span>
          <span className="text-[10px] text-[#F6F1E8]/50 block mt-0.5">Zero double-bookings</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#28B85B]/20 pb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`pb-1 transition-colors ${
            activeTab === 'ALL' ? 'text-[#28B85B] border-b-2 border-[#28B85B]' : 'text-[#F6F1E8]/60 hover:text-white'
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setActiveTab('EV')}
          className={`pb-1 transition-colors ${
            activeTab === 'EV' ? 'text-[#28B85B] border-b-2 border-[#28B85B]' : 'text-[#F6F1E8]/60 hover:text-white'
          }`}
        >
          EV Charging ({evReservations.length})
        </button>
        <button
          onClick={() => setActiveTab('CNG')}
          className={`pb-1 transition-colors ${
            activeTab === 'CNG' ? 'text-[#168BDB] border-b-2 border-[#168BDB]' : 'text-[#F6F1E8]/60 hover:text-white'
          }`}
        >
          CNG Windows ({cngWindows.length})
        </button>
      </div>

      {/* Anti-No-Show / Overstay Policy Banner (Section 9) */}
      <div className="p-3 bg-[#031815] rounded-xl border border-[#28B85B]/20 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-4 h-4 text-[#28B85B] shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-[#F6F1E8]/75 text-[11px]">
          <span className="font-bold text-[#F6F1E8] block">Routiq Anti-No-Show &amp; Overstay Assurance</span>
          <span>
            EV bays have a 15-minute grace window. If a user fails to arrive, the bay is dynamically released to waiting corridor drivers. After 100% charging is reached, a 10-minute idle grace period applies before overstay parking tariffs activate.
          </span>
        </div>
      </div>

      {/* History Items List */}
      <div className="space-y-3">
        {/* EV Reservations */}
        {(activeTab === 'ALL' || activeTab === 'EV') &&
          evReservations.map((ev) => (
            <div
              key={ev.id}
              className="p-4 bg-[#062B25]/70 rounded-xl border border-[#28B85B]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#28B85B]/15 border border-[#28B85B]/40 text-[#28B85B] flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{ev.bayNumber}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#28B85B]/20 text-[#28B85B] font-mono font-bold">
                      {ev.status}
                    </span>
                    <span className="text-[#F6F1E8]/50 font-mono text-[11px]">#{ev.id}</span>
                  </div>
                  <div className="text-[#F6F1E8]/90 mt-0.5 font-medium">{ev.stationName}</div>
                  <div className="text-[#F6F1E8]/60 text-[11px] mt-1 flex flex-wrap items-center gap-2 font-mono">
                    <span>Window: {ev.arrivalWindow}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ev.powerKW} kW {ev.connectorType}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#28B85B]">Grace: +{ev.gracePeriodMinutes}m</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-right">
                  <div className="font-mono text-white font-bold text-sm">₹{ev.totalAmount}</div>
                  <div className="text-[10px] text-[#28B85B]">Deposit Held</div>
                </div>
                {onViewPass && (
                  <button
                    onClick={() => onViewPass(ev)}
                    className="p-2 bg-[#031815] hover:bg-[#062B25] text-[#28B85B] border border-[#28B85B]/30 rounded-lg transition-colors"
                    title="View QR Pass"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

        {/* CNG Windows */}
        {(activeTab === 'ALL' || activeTab === 'CNG') &&
          cngWindows.map((gw) => (
            <div
              key={gw.id}
              className="p-4 bg-[#062B25]/70 rounded-xl border border-[#168BDB]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#168BDB]/15 border border-[#168BDB]/40 text-[#168BDB] flex items-center justify-center shrink-0">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {gw.greenWindowStart} – {gw.greenWindowEnd}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#168BDB]/20 text-[#168BDB] font-mono font-bold">
                      {gw.status}
                    </span>
                    <span className="text-[#F6F1E8]/50 font-mono text-[11px]">#{gw.id}</span>
                  </div>
                  <div className="text-[#F6F1E8]/90 mt-0.5 font-medium">{gw.stationName}</div>
                  <div className="text-[#F6F1E8]/60 text-[11px] mt-1 flex flex-wrap items-center gap-2 font-mono">
                    <span>Queue Pos #{gw.queuePosition}</span>
                    <span aria-hidden="true">·</span>
                    <span>Category: {gw.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>Est. Wait: ~{gw.estimatedWaitMinutes}m</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {onOpenSlotExchange && gw.status === 'ASSIGNED' && (
                  <button
                    onClick={() => onOpenSlotExchange(gw)}
                    className="px-3 py-1.5 bg-[#031815] hover:bg-[#062B25] text-[#168BDB] rounded-lg text-xs font-semibold border border-[#168BDB]/30 transition-colors"
                  >
                    Exchange Window
                  </button>
                )}
              </div>
            </div>
          ))}

        {evReservations.length === 0 && cngWindows.length === 0 && (
          <div className="p-8 text-center text-xs text-[#F6F1E8]/50 bg-[#062B25]/30 rounded-xl border border-[#062B25]">
            No upcoming reservations. Use "Find a Charger" or "Plan with TRIPP" to reserve your first charging bay.
          </div>
        )}
      </div>
    </div>
  );
};
