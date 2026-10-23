import React, { useState } from 'react';
import {
  Activity,
  Zap,
  Fuel,
  Compass,
  Download,
  Calendar,
  CheckCircle2,
  TrendingDown,
  Leaf,
  Clock,
  ArrowRight
} from 'lucide-react';

interface ActivityViewProps {
  onPlanTripFromHistory?: (destination: string) => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({ onPlanTripFromHistory }) => {
  const [filter, setFilter] = useState<'ALL' | 'EV' | 'CNG'>('ALL');

  const historyItems = [
    {
      id: 'ACT-9821',
      type: 'EV',
      title: 'Fast Charge — Tata Nexon EV',
      stationName: 'Jio-bp pulse & Clean Fuels — Gachibowli ORR',
      bay: 'Bay 02 (150kW CCS2)',
      date: 'Today, 11:20 AM',
      energyOrGas: '28.4 kWh',
      durationMinutes: 32,
      costINR: 412,
      co2SavedKg: 8.4,
      gstInvoice: 'INV-RQ-2026-9821.pdf',
    },
    {
      id: 'ACT-9742',
      type: 'CNG',
      title: 'Virtual Green Window — WagonR CNG',
      stationName: 'Bhagyanagar Gas Ltd — Madhapur Manifold',
      bay: 'Dispenser D2 (215 bar)',
      date: '21 Oct, 04:45 PM',
      energyOrGas: '7.8 kg',
      durationMinutes: 6,
      costINR: 698,
      co2SavedKg: 4.2,
      gstInvoice: 'INV-RQ-2026-9742.pdf',
    },
    {
      id: 'ACT-9610',
      type: 'EV',
      title: 'Top-Up Charge — Ather 450X',
      stationName: 'Ather Grid — Hitec City Cyber Gateway',
      bay: 'Pod 01 (Ather Dot DC)',
      date: '19 Oct, 02:15 PM',
      energyOrGas: '2.8 kWh',
      durationMinutes: 24,
      costINR: 52,
      co2SavedKg: 1.1,
      gstInvoice: 'INV-RQ-2026-9610.pdf',
    },
    {
      id: 'ACT-9520',
      type: 'EV',
      title: 'Highway Fast Charge — Nexon EV',
      stationName: 'Tata Power EZ Charge — Financial District Hub',
      bay: 'Bay 01 (60kW CCS2)',
      date: '16 Oct, 07:30 PM',
      energyOrGas: '31.2 kWh',
      durationMinutes: 44,
      costINR: 452,
      co2SavedKg: 9.3,
      gstInvoice: 'INV-RQ-2026-9520.pdf',
    },
    {
      id: 'ACT-9405',
      type: 'CNG',
      title: 'Virtual Green Window — Auto-Rickshaw',
      stationName: 'HPCL Auto Gas & CNG Hub — Miyapur X Roads',
      bay: 'Fast Manifold 04',
      date: '14 Oct, 08:10 AM',
      energyOrGas: '4.5 kg',
      durationMinutes: 5,
      costINR: 402,
      co2SavedKg: 2.8,
      gstInvoice: 'INV-RQ-2026-9405.pdf',
    },
  ];

  const filtered = historyItems.filter((item) => {
    if (filter === 'EV') return item.type === 'EV';
    if (filter === 'CNG') return item.type === 'CNG';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#07130F] border border-[#25C269]/25 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#25C269]" />
              <h2 className="text-xl font-extrabold text-[#F6F1E8] tracking-tight">
                Activity &amp; Journey History
              </h2>
            </div>
            <p className="text-xs text-[#F6F1E8]/70 mt-1">
              Complete records of charging sessions, CNG fills, and verified carbon savings across Hyderabad corridors.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-[#031815] rounded-xl border border-[#062B25] text-xs">
            {(['ALL', 'EV', 'CNG'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                  filter === tab
                    ? 'bg-[#25C269] text-[#07130F] shadow-sm'
                    : 'text-[#F6F1E8]/60 hover:text-white'
                }`}
              >
                {tab === 'ALL' && 'All Sessions'}
                {tab === 'EV' && '⚡ EV Charges'}
                {tab === 'CNG' && '⛽ CNG Refuels'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aggregate Savings Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#07130F] rounded-2xl border border-[#25C269]/20 text-xs shadow-md">
        <div className="p-3 bg-[#031815] rounded-xl border border-[#062B25]">
          <span className="text-[#F6F1E8]/60 text-[11px] block flex items-center gap-1">
            <Leaf className="w-3.5 h-3.5 text-[#25C269]" />
            <span>CO₂ Avoided</span>
          </span>
          <span className="text-lg font-bold font-mono text-white block mt-1">142.4 kg</span>
          <span className="text-[10px] text-[#25C269] block">Equivalent to 7 trees</span>
        </div>

        <div className="p-3 bg-[#031815] rounded-xl border border-[#062B25]">
          <span className="text-[#F6F1E8]/60 text-[11px] block flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-[#25C269]" />
            <span>Money Saved</span>
          </span>
          <span className="text-lg font-bold font-mono text-white block mt-1">₹4,280</span>
          <span className="text-[10px] text-[#25C269] block">vs petrol equivalent</span>
        </div>

        <div className="p-3 bg-[#031815] rounded-xl border border-[#062B25]">
          <span className="text-[#F6F1E8]/60 text-[11px] block flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#25C269]" />
            <span>Queue Time Saved</span>
          </span>
          <span className="text-lg font-bold font-mono text-white block mt-1">4.8 hours</span>
          <span className="text-[10px] text-[#25C269] block">Via Green Windows</span>
        </div>

        <div className="p-3 bg-[#031815] rounded-xl border border-[#062B25]">
          <span className="text-[#F6F1E8]/60 text-[11px] block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#25C269]" />
            <span>Success Rate</span>
          </span>
          <span className="text-lg font-bold font-mono text-white block mt-1">100%</span>
          <span className="text-[10px] text-[#25C269] block">Zero double-bookings</span>
        </div>
      </div>

      {/* Session History List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-[#07130F] rounded-2xl border border-[#25C269]/20 hover:border-[#25C269]/40 transition-colors shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                  item.type === 'EV' ? 'bg-[#168BDB]/20 text-[#168BDB]' : 'bg-[#25C269]/20 text-[#25C269]'
                }`}
              >
                {item.type === 'EV' ? <Zap className="w-5 h-5 fill-current" /> : <Fuel className="w-5 h-5" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">{item.title}</h4>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#031815] text-[#F6F1E8]/60">
                    {item.id}
                  </span>
                </div>
                <p className="text-xs text-[#F6F1E8]/70 mt-0.5">{item.stationName}</p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#F6F1E8]/50 mt-1">
                  <span>{item.bay}</span>
                  <span>·</span>
                  <span>{item.date}</span>
                  <span>·</span>
                  <span className="text-[#25C269] font-mono font-medium">{item.energyOrGas}</span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#062B25] gap-1 shrink-0">
              <span className="text-base font-extrabold font-mono text-white">
                ₹{item.costINR}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Downloading GST Tax Invoice for session ${item.id}`)}
                  className="px-2.5 py-1 rounded-lg bg-[#031815] hover:bg-[#062B25] text-[#F6F1E8]/70 hover:text-white border border-[#062B25] text-[10px] flex items-center gap-1 transition-colors"
                  title="Download GST Invoice"
                >
                  <Download className="w-3 h-3" />
                  <span>GST Invoice</span>
                </button>
                {onPlanTripFromHistory && (
                  <button
                    onClick={() => onPlanTripFromHistory(item.stationName)}
                    className="px-2.5 py-1 rounded-lg bg-[#25C269]/15 hover:bg-[#25C269]/25 text-[#25C269] border border-[#25C269]/30 text-[10px] flex items-center gap-1 font-semibold transition-colors"
                  >
                    <Compass className="w-3 h-3" />
                    <span>Plan in TRIPP</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
