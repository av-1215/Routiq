import React, { useState } from 'react';
import { EVReservation, CNGGreenWindow } from '../types';
import {
  Calendar,
  Zap,
  Fuel,
  QrCode,
  MapPin,
  Clock,
  ShieldCheck,
  Navigation,
  ArrowRight,
  AlertTriangle,
  RotateCw,
  CheckCircle2,
  XCircle,
  Key
} from 'lucide-react';

interface BookingsViewProps {
  evReservations: EVReservation[];
  cngWindows: CNGGreenWindow[];
  onOpenSlotExchange: (gw: CNGGreenWindow) => void;
  onSelectStationById?: (stationId: string) => void;
  onCancelEVBooking?: (id: string) => void;
  onCancelCNGWindow?: (id: string) => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  evReservations,
  cngWindows,
  onOpenSlotExchange,
  onSelectStationById,
  onCancelEVBooking,
  onCancelCNGWindow,
}) => {
  const [filterTab, setFilterTab] = useState<'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ACTIVE');
  const [activeQrModal, setActiveQrModal] = useState<string | null>(null);

  // Mock completed bookings
  const completedBookings = [
    {
      id: 'RQ-EV-COMP-8831',
      type: 'EV',
      title: 'Jio-bp pulse — Gachibowli Bay 02',
      date: 'Yesterday, 18:40',
      units: '28.4 kWh',
      amount: '₹412',
      status: 'COMPLETED',
    },
    {
      id: 'RQ-CNG-COMP-7729',
      type: 'CNG',
      title: 'Bhagyanagar Gas — Madhapur Manifold',
      date: '20 Oct, 09:15',
      units: '6.2 kg',
      amount: '₹554',
      status: 'COMPLETED',
    },
    {
      id: 'RQ-EV-COMP-6612',
      type: 'EV',
      title: 'Ather Grid — Hitec City Cyber Gateway',
      date: '18 Oct, 14:10',
      units: '3.2 kWh',
      amount: '₹58',
      status: 'COMPLETED',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#07130F] border border-[#25C269]/25 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#25C269]" />
              <h2 className="text-xl font-extrabold text-[#F6F1E8] tracking-tight">
                My Bookings &amp; Digital Passes
              </h2>
            </div>
            <p className="text-xs text-[#F6F1E8]/70 mt-1">
              Active hardware locks, verified QR entry passes, and virtual queue tokens for zero-wait access.
            </p>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#031815] rounded-xl border border-[#062B25] text-xs">
            {(['ACTIVE', 'UPCOMING', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filterTab === tab
                    ? 'bg-[#25C269] text-[#07130F] shadow-sm'
                    : 'text-[#F6F1E8]/60 hover:text-white'
                }`}
              >
                {tab === 'ACTIVE' && `Active (${evReservations.length + cngWindows.length})`}
                {tab === 'UPCOMING' && 'Upcoming (0)'}
                {tab === 'COMPLETED' && `Completed (${completedBookings.length})`}
                {tab === 'CANCELLED' && 'Cancelled (0)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filterTab === 'ACTIVE' && (
        <div className="space-y-4">
          {evReservations.length === 0 && cngWindows.length === 0 ? (
            <div className="text-center py-12 bg-[#07130F] rounded-2xl border border-[#25C269]/20 p-8 space-y-3">
              <Calendar className="w-10 h-10 text-[#25C269]/40 mx-auto" />
              <h3 className="font-bold text-white text-base">No Active Passes</h3>
              <p className="text-xs text-[#F6F1E8]/60 max-w-sm mx-auto">
                Reserve an EV bay or join a CNG virtual queue from Home or Explore to get a zero-wait pass.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Active EV Reservations */}
              {evReservations.map((res) => (
                <div
                  key={res.id}
                  className="bg-[#07130F] border-2 border-[#168BDB] rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-[#062B25] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#168BDB] animate-ping" />
                      <span className="font-extrabold text-sm text-[#168BDB] tracking-wide">
                        ⚡ EV BAY RESERVED (15m HOLD)
                      </span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#168BDB]/20 text-[#168BDB] font-bold border border-[#168BDB]/30">
                      {res.id}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white leading-snug">
                      {res.stationName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#F6F1E8]/70">
                      <span className="px-2 py-0.5 rounded bg-[#031815] font-mono font-semibold text-[#168BDB]">
                        {res.bayNumber}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-white">{res.powerKW} kW {res.connectorType}</span>
                    </div>
                  </div>

                  {/* Pass Details Grid */}
                  <div className="p-3.5 bg-[#031815] rounded-xl border border-[#062B25] grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[#F6F1E8]/50 text-[10px] block">Arrival Window</span>
                      <span className="font-mono font-bold text-sm text-white">
                        {res.arrivalWindow}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#F6F1E8]/50 text-[10px] block">Hold Security PIN</span>
                      <span className="font-mono font-bold text-sm text-[#25C269] flex items-center justify-center gap-1">
                        <Key className="w-3 h-3" />
                        <span>8492</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[#F6F1E8]/50 text-[10px] block">Security Hold</span>
                      <span className="font-mono font-bold text-sm text-white">
                        ₹{res.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* QR Pass Box */}
                  <div className="p-3 bg-[#031815] rounded-xl border border-[#25C269]/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center">
                        <QrCode className="w-10 h-10 text-[#07130F]" />
                      </div>
                      <div>
                        <span className="font-bold text-white text-xs block">
                          Instant Contact Contactor Pass
                        </span>
                        <span className="text-[10px] text-[#F6F1E8]/60 font-mono">
                          {res.qrCodeToken}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveQrModal(res.qrCodeToken)}
                      className="px-3 py-1.5 bg-[#25C269]/20 hover:bg-[#25C269]/30 text-[#25C269] font-bold rounded-lg border border-[#25C269]/40 text-xs transition-colors"
                    >
                      Enlarge QR
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onSelectStationById?.(res.stationId)}
                      className="flex-1 py-2.5 bg-[#168BDB] hover:bg-[#168BDB]/90 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Start Navigation</span>
                    </button>
                    {onCancelEVBooking && (
                      <button
                        onClick={() => onCancelEVBooking(res.id)}
                        className="px-3 py-2.5 bg-[#031815] hover:bg-red-500/15 text-[#F6F1E8]/60 hover:text-red-400 border border-[#062B25] hover:border-red-500/30 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Active CNG Virtual Windows */}
              {cngWindows.map((win) => (
                <div
                  key={win.id}
                  className="bg-[#07130F] border-2 border-[#25C269] rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-[#062B25] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#25C269] animate-ping" />
                      <span className="font-extrabold text-sm text-[#25C269] tracking-wide">
                        ⛽ CNG VIRTUAL QUEUE ACTIVE
                      </span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#25C269]/20 text-[#25C269] font-bold border border-[#25C269]/30">
                      {win.id}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white leading-snug">
                      {win.stationName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#F6F1E8]/70">
                      <span className="text-[#25C269] font-bold">
                        Queue Position #{win.queuePosition}
                      </span>
                      <span>·</span>
                      <span>{win.queuePosition - 1} vehicles ahead of you</span>
                    </div>
                  </div>

                  {/* Metric Box */}
                  <div className="p-3.5 bg-[#031815] rounded-xl border border-[#062B25] grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[#F6F1E8]/50 text-[10px] block">Green Window</span>
                      <span className="font-mono font-bold text-sm text-white">
                        {win.greenWindowStart} – {win.greenWindowEnd}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#F6F1E8]/50 text-[10px] block">Est. Wait at Pump</span>
                      <span className="font-mono font-bold text-sm text-[#25C269]">
                        ~{win.estimatedWaitMinutes} min
                      </span>
                    </div>
                    <div>
                      <span className="text-[#F6F1E8]/50 text-[10px] block">Ghost Risk</span>
                      <span className="font-mono font-bold text-sm text-white">
                        {win.ghostRiskScore}% (Low)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onOpenSlotExchange(win)}
                      className="flex-1 py-2.5 bg-[#25C269]/20 hover:bg-[#25C269]/30 text-[#25C269] border border-[#25C269]/40 font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Exchange Window (+30m)</span>
                    </button>
                    <button
                      onClick={() => onSelectStationById?.(win.stationId)}
                      className="px-4 py-2.5 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Navigate</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completed Bookings Tab */}
      {filterTab === 'COMPLETED' && (
        <div className="space-y-3">
          {completedBookings.map((b) => (
            <div
              key={b.id}
              className="p-4 bg-[#07130F] border border-[#25C269]/20 rounded-xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    b.type === 'EV' ? 'bg-[#168BDB]/20 text-[#168BDB]' : 'bg-[#25C269]/20 text-[#25C269]'
                  }`}
                >
                  {b.type === 'EV' ? <Zap className="w-4 h-4" /> : <Fuel className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{b.title}</h4>
                  <div className="text-[#F6F1E8]/60 text-[11px] mt-0.5">
                    {b.date} · {b.units} dispensed
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-sm text-white block">{b.amount}</span>
                <span className="text-[10px] text-[#25C269] font-medium flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>GST Paid</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Enlarged QR */}
      {activeQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#07130F] border border-[#25C269]/50 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Routiq Bay Contactor Pass</h3>
            <div className="w-48 h-48 bg-white rounded-2xl p-3 mx-auto flex items-center justify-center shadow-lg">
              <QrCode className="w-full h-full text-[#07130F]" />
            </div>
            <p className="font-mono text-xs text-[#25C269]">{activeQrModal}</p>
            <p className="text-[11px] text-[#F6F1E8]/70">
              Hold within 5 cm of the charger optical scanner to release the connector contactor.
            </p>
            <button
              onClick={() => setActiveQrModal(null)}
              className="w-full py-2.5 bg-[#25C269] text-[#07130F] font-bold text-xs rounded-xl"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
