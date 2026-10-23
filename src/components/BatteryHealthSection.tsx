import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import {
  BatteryCharging,
  Zap,
  TrendingUp,
  Leaf,
  ShieldCheck,
  IndianRupee,
  Activity,
  Award,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { Vehicle } from '../types';

interface BatteryHealthSectionProps {
  vehicle: Vehicle;
}

// 6-Month State of Health (SoH) and Cycle Retention
const BATTERY_HEALTH_TREND = [
  { month: 'May 2026', cycles: 42, soh: 99.8, rangeCapacityKm: 312, cellBalanceMv: 4.2 },
  { month: 'Jun 2026', cycles: 88, soh: 99.4, rangeCapacityKm: 311, cellBalanceMv: 4.8 },
  { month: 'Jul 2026', cycles: 135, soh: 99.1, rangeCapacityKm: 310, cellBalanceMv: 5.1 },
  { month: 'Aug 2026', cycles: 182, soh: 98.8, rangeCapacityKm: 309, cellBalanceMv: 4.9 },
  { month: 'Sep 2026', cycles: 230, soh: 98.6, rangeCapacityKm: 308, cellBalanceMv: 4.6 },
  { month: 'Oct 2026', cycles: 284, soh: 98.4, rangeCapacityKm: 307, cellBalanceMv: 4.3 },
];

// Monthly Energy Consumption vs ₹ Fuel Cost Savings (EV vs Petrol Equivalent)
const MONTHLY_SAVINGS_DATA = [
  { month: 'May', evCostINR: 1240, petrolCostINR: 6850, savingsINR: 5610, energyKWh: 178, co2SavedKg: 134 },
  { month: 'Jun', evCostINR: 1480, petrolCostINR: 8120, savingsINR: 6640, energyKWh: 212, co2SavedKg: 158 },
  { month: 'Jul', evCostINR: 1610, petrolCostINR: 8940, savingsINR: 7330, energyKWh: 230, co2SavedKg: 172 },
  { month: 'Aug', evCostINR: 1320, petrolCostINR: 7350, savingsINR: 6030, energyKWh: 189, co2SavedKg: 141 },
  { month: 'Sep', evCostINR: 1890, petrolCostINR: 10420, savingsINR: 8530, energyKWh: 270, co2SavedKg: 201 },
  { month: 'Oct', evCostINR: 1520, petrolCostINR: 8460, savingsINR: 6940, energyKWh: 218, co2SavedKg: 163 },
];

// Charging Distribution (AC Home 7.2kW, DC Fast 60kW, Ultra-Fast 120-150kW)
const CHARGING_MIX_DATA = [
  { name: 'AC Slow / Overnight (7.2kW)', value: 64, color: '#25C269', desc: 'Optimum for pack longevity' },
  { name: 'DC Fast (30-60kW)', value: 24, color: '#168BDB', desc: 'Mid-range corridor top-ups' },
  { name: 'Ultra-Fast (120-150kW)', value: 12, color: '#F3C45B', desc: 'Emergency highway fast boost' },
];

// 24-Hour Typical Thermal & C-rate Efficiency
const EFFICIENCY_BY_TEMP = [
  { ambientTempC: '18°C (Night)', efficiencyWhKm: 132, regenPct: 18 },
  { ambientTempC: '25°C (Morning)', efficiencyWhKm: 128, regenPct: 22 },
  { ambientTempC: '32°C (Midday)', efficiencyWhKm: 138, regenPct: 19 },
  { ambientTempC: '39°C (Heatwave)', efficiencyWhKm: 152, regenPct: 16 },
  { ambientTempC: '28°C (Evening)', efficiencyWhKm: 134, regenPct: 21 },
];

export const BatteryHealthSection: React.FC<BatteryHealthSectionProps> = ({ vehicle }) => {
  const [activeMetric, setActiveMetric] = useState<'HEALTH' | 'SAVINGS' | 'MIX'>('HEALTH');

  const isEV = vehicle.type === 'EV';
  const totalSavingsINR = MONTHLY_SAVINGS_DATA.reduce((acc, curr) => acc + curr.savingsINR, 0);
  const totalCo2SavedKg = MONTHLY_SAVINGS_DATA.reduce((acc, curr) => acc + curr.co2SavedKg, 0);
  const totalEnergyKWh = MONTHLY_SAVINGS_DATA.reduce((acc, curr) => acc + curr.energyKWh, 0);

  return (
    <div className="bg-[#07130F] border border-[#25C269]/25 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#062B25] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#031815] border-2 border-[#25C269] flex items-center justify-center text-[#25C269] shadow-inner">
            <BatteryCharging className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-[#25C269]/20 text-[#25C269] border border-[#25C269]/30">
                BMS Telemetry Verified
              </span>
              <span className="text-xs text-[#F6F1E8]/60 font-mono">
                {vehicle.name}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Battery Health &amp; Energy Efficiency
            </h3>
          </div>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex p-1 bg-[#031815] rounded-xl border border-[#062B25] self-start sm:self-auto">
          <button
            onClick={() => setActiveMetric('HEALTH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMetric === 'HEALTH'
                ? 'bg-[#25C269] text-[#07130F] shadow'
                : 'text-[#F6F1E8]/70 hover:text-white'
            }`}
          >
            Health (SoH)
          </button>
          <button
            onClick={() => setActiveMetric('SAVINGS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMetric === 'SAVINGS'
                ? 'bg-[#168BDB] text-white shadow'
                : 'text-[#F6F1E8]/70 hover:text-white'
            }`}
          >
            ₹ Savings
          </button>
          <button
            onClick={() => setActiveMetric('MIX')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMetric === 'MIX'
                ? 'bg-[#F3C45B] text-[#07130F] shadow'
                : 'text-[#F6F1E8]/70 hover:text-white'
            }`}
          >
            Charging Mix
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: SoH */}
        <div className="p-4 rounded-2xl bg-[#031815] border border-[#25C269]/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#F6F1E8]/70">
            <span>State of Health</span>
            <ShieldCheck className="w-4 h-4 text-[#25C269]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">98.4%</span>
            <span className="text-[11px] font-bold text-[#25C269]">+0.2% vs avg</span>
          </div>
          <p className="text-[10px] text-[#F6F1E8]/50">
            Cell Delta: 4.3 mV (Excellent balance)
          </p>
        </div>

        {/* KPI 2: Total ₹ Savings */}
        <div className="p-4 rounded-2xl bg-[#031815] border border-[#168BDB]/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#F6F1E8]/70">
            <span>Total Fuel Saved</span>
            <IndianRupee className="w-4 h-4 text-[#168BDB]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              ₹{totalSavingsINR.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[10px] text-[#168BDB]">
            vs petrol over 6 months
          </p>
        </div>

        {/* KPI 3: Energy Efficiency */}
        <div className="p-4 rounded-2xl bg-[#031815] border border-[#25C269]/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#F6F1E8]/70">
            <span>Avg Consumption</span>
            <Activity className="w-4 h-4 text-[#25C269]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">131</span>
            <span className="text-xs text-[#F6F1E8]/70 font-mono">Wh/km</span>
          </div>
          <p className="text-[10px] text-[#25C269]">
            7.6 km per kWh on Hyderabad ORR
          </p>
        </div>

        {/* KPI 4: Carbon Offset */}
        <div className="p-4 rounded-2xl bg-[#031815] border border-[#F3C45B]/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#F6F1E8]/70">
            <span>CO₂ Emissions Prevented</span>
            <Leaf className="w-4 h-4 text-[#25C269]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {totalCo2SavedKg}
            </span>
            <span className="text-xs text-[#F6F1E8]/70 font-mono">kg CO₂</span>
          </div>
          <p className="text-[10px] text-[#F3C45B]">
            Equivalent to planting 48 trees
          </p>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#031815] border border-[#062B25] space-y-4">
        {/* Metric 1: Health (SoH) over Cycle Count */}
        {activeMetric === 'HEALTH' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#25C269]" />
                  <span>State of Health (SoH) Retention vs Fast Charge Cycles</span>
                </h4>
                <p className="text-xs text-[#F6F1E8]/60 mt-0.5">
                  Pack retention is outperforming typical degradation curves by 1.8% due to Routiq smart battery target buffering.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#25C269] bg-[#25C269]/10 px-2.5 py-1 rounded-lg border border-[#25C269]/20 self-start sm:self-auto">
                284 Total Cycles · 14,200 km
              </span>
            </div>

            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={BATTERY_HEALTH_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sohGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#25C269" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#25C269" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#062B25" />
                  <XAxis dataKey="month" stroke="#F6F1E8" opacity={0.6} tick={{ fontSize: 11 }} />
                  <YAxis domain={[97, 100]} stroke="#F6F1E8" opacity={0.6} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#07130F',
                      borderColor: '#25C269',
                      borderRadius: '12px',
                      color: '#F6F1E8',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, name: any) => {
                      if (name === 'soh') return [`${val}%`, 'State of Health'];
                      if (name === 'rangeCapacityKm') return [`${val} km`, 'Full Pack Range'];
                      return [val, name];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="soh"
                    name="soh"
                    stroke="#25C269"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#sohGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="rangeCapacityKm"
                    name="rangeCapacityKm"
                    stroke="#168BDB"
                    strokeWidth={2}
                    dot={{ fill: '#168BDB', r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-xs text-[#F6F1E8]/70 pt-2 border-t border-[#062B25]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#25C269]" />
                <span>State of Health (SoH) %</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#168BDB]" />
                <span>Pack Max Usable Range (km)</span>
              </span>
              <span className="font-mono text-[#25C269]">
                Estimated 8-year retention: 91.2%
              </span>
            </div>
          </div>
        )}

        {/* Metric 2: ₹ Fuel Savings & Energy Comparison */}
        {activeMetric === 'SAVINGS' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-[#168BDB]" />
                  <span>Monthly Electric Charging Cost vs Petrol Cost</span>
                </h4>
                <p className="text-xs text-[#F6F1E8]/60 mt-0.5">
                  Comparison based on equivalent 1,450 km/month driving at ₹108/litre petrol vs ₹19.5/kWh DC charging.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#168BDB] bg-[#168BDB]/10 px-2.5 py-1 rounded-lg border border-[#168BDB]/20 self-start sm:self-auto">
                Avg Savings: ₹6,845 / month
              </span>
            </div>

            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY_SAVINGS_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#062B25" />
                  <XAxis dataKey="month" stroke="#F6F1E8" opacity={0.6} tick={{ fontSize: 11 }} />
                  <YAxis stroke="#F6F1E8" opacity={0.6} tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#07130F',
                      borderColor: '#168BDB',
                      borderRadius: '12px',
                      color: '#F6F1E8',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, name: any) => {
                      if (name === 'petrolCostINR') return [`₹${val.toLocaleString('en-IN')}`, 'Petrol Equivalent'];
                      if (name === 'evCostINR') return [`₹${val.toLocaleString('en-IN')}`, 'Routiq EV Cost'];
                      if (name === 'savingsINR') return [`₹${val.toLocaleString('en-IN')}`, 'Net ₹ Saved'];
                      return [val, name];
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    formatter={(val) => {
                      if (val === 'petrolCostINR') return 'Petrol Cost (Est)';
                      if (val === 'evCostINR') return 'Actual Routiq EV Cost';
                      return val;
                    }}
                  />
                  <Bar dataKey="petrolCostINR" fill="#F3C45B" radius={[4, 4, 0, 0]} opacity={0.7} />
                  <Bar dataKey="evCostINR" fill="#25C269" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-[#07130F] rounded-xl border border-[#062B25] flex items-center justify-between text-xs">
              <span className="text-[#F6F1E8]/70">Cumulative 6-Month Energy:</span>
              <span className="font-mono font-bold text-white">{totalEnergyKWh} kWh consumed</span>
              <span className="text-[#25C269] font-bold">Net Saved: ₹{totalSavingsINR.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        {/* Metric 3: Charging Mix & Thermal Efficiency */}
        {activeMetric === 'MIX' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#F3C45B]" />
                <span>Historical Charging Mix &amp; C-rate Distribution</span>
              </h4>
              <p className="text-xs text-[#F6F1E8]/60 mt-0.5">
                Balancing slow AC overnight charging with high-speed DC charging preserves lithium-ion electrolyte structure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {CHARGING_MIX_DATA.map((item) => (
                <div
                  key={item.name}
                  className="p-4 rounded-xl bg-[#07130F] border border-[#062B25] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{item.name}</span>
                    <span
                      className="font-mono font-black text-sm px-2 py-0.5 rounded"
                      style={{ color: item.color, backgroundColor: `${item.color}15` }}
                    >
                      {item.value}%
                    </span>
                  </div>
                  <div className="w-full bg-[#031815] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <p className="text-[10px] text-[#F6F1E8]/60">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Ambient Temperature vs Wh/km Indian Road Conditions */}
            <div className="p-3.5 bg-[#07130F] rounded-xl border border-[#062B25] space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Thermal Efficiency in Indian Ambient Conditions (Hyd ORR)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                {EFFICIENCY_BY_TEMP.map((item) => (
                  <div key={item.ambientTempC} className="p-2 rounded-lg bg-[#031815] border border-[#062B25]">
                    <span className="text-[11px] text-[#F6F1E8]/60 block">{item.ambientTempC}</span>
                    <span className="text-sm font-mono font-bold text-[#25C269] block mt-0.5">
                      {item.efficiencyWhKm} Wh/km
                    </span>
                    <span className="text-[10px] text-[#168BDB] block">
                      Regen: {item.regenPct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Battery Care Recommendations from Routiq Algorithms */}
      <div className="p-4 rounded-2xl bg-[#031815] border border-[#25C269]/20 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-[#25C269] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-extrabold text-white block">
            Routiq BMS Advisory: Buffer Target Set at 80%
          </span>
          <p className="text-[#F6F1E8]/70 leading-relaxed">
            Stopping daily DC fast charging at 80% rather than 100% reduces cathode micro-cracking and maintains your Tata Nexon EV warranty compliance while slashing wait times at highway hubs.
          </p>
        </div>
      </div>
    </div>
  );
};
