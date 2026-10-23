import React, { useState } from 'react';
import { Station } from '../types';
import { Activity, Gauge, Users, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2, TrendingUp, BarChart3 } from 'lucide-react';
import { calculateCongestionIndex } from '../algorithms/cngDecongestion';

interface CongestionControlDashboardProps {
  stations: Station[];
  onTriggerReroute: (sourceStationId: string, targetStationId: string, count: number) => void;
}

export const CongestionControlDashboard: React.FC<CongestionControlDashboardProps> = ({
  stations,
  onTriggerReroute,
}) => {
  const cngAndHybridStations = stations.filter((s) => s.type !== 'EV');
  const [selectedStationId, setSelectedStationId] = useState<string>(cngAndHybridStations[0]?.id || stations[0].id);

  const activeStation = stations.find((s) => s.id === selectedStationId) || stations[0];
  const congestionAnalysis = calculateCongestionIndex(activeStation, 8);

  const [simulatedIncoming60Min, setSimulatedIncoming60Min] = useState([
    { slot: 'Next 15m', vehicles: 4, isPeak: false },
    { slot: '15m–30m', vehicles: 8, isPeak: false },
    { slot: '30m–45m', vehicles: 14, isPeak: true },
    { slot: '45m–60m', vehicles: 6, isPeak: false },
  ]);

  // Hourly demand forecast (Section 22 of prompt)
  const hourlyDemandForecast = [
    { hour: '6:00 PM', level: 'High Demand', color: 'text-[#F3C45B]', bg: 'bg-[#F3C45B]/20', queueTrend: '~12 min wait', bayOccupancy: '85%' },
    { hour: '7:00 PM', level: 'Very High Demand', color: 'text-red-400', bg: 'bg-red-500/20', queueTrend: '~22 min wait (Peak)', bayOccupancy: '100% (Full)' },
    { hour: '8:00 PM', level: 'Moderate', color: 'text-[#28B85B]', bg: 'bg-[#28B85B]/20', queueTrend: '~7 min wait', bayOccupancy: '60%' },
    { hour: '9:00 PM', level: 'Low Demand', color: 'text-[#168BDB]', bg: 'bg-[#168BDB]/20', queueTrend: '~3 min wait', bayOccupancy: '30%' },
  ];

  const [rerouteSuccessMessage, setRerouteSuccessMessage] = useState<string | null>(null);

  const handleRerouteVehicles = () => {
    const targetAlt = stations.find((s) => s.id !== activeStation.id && s.type !== 'EV');
    if (!targetAlt) return;

    onTriggerReroute(activeStation.id, targetAlt.id, 3);
    setRerouteSuccessMessage(`Reroute Dispatched: 3 incoming vehicles redirected to ${targetAlt.name} via updated Green Windows.`);
    setTimeout(() => setRerouteSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#28B85B]/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#28B85B] mb-1">
            <Activity className="w-4 h-4" />
            <span>STATION OPERATOR &amp; AIR-TRAFFIC-CONTROL PORTAL</span>
          </div>
          <h2 className="text-2xl font-bold text-[#F6F1E8]">Station Congestion &amp; Demand Control</h2>
          <p className="text-xs text-[#F6F1E8]/70">
            Real-time dispenser manifold SCADA telemetry, hourly demand forecasting, and corridor redistribution.
          </p>
        </div>

        {/* Station Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#F6F1E8]/70">Active Hub:</span>
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="bg-[#031815] border border-[#28B85B]/30 text-white text-xs rounded-lg px-3 py-2 focus:outline-none"
          >
            {cngAndHybridStations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {rerouteSuccessMessage && (
        <div className="p-3 bg-[#28B85B]/20 border border-[#28B85B] rounded-xl text-xs text-[#28B85B] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#28B85B] shrink-0" />
          <span>{rerouteSuccessMessage}</span>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Congestion Index */}
        <div className="p-4 bg-[#062B25] rounded-xl border border-[#28B85B]/20 space-y-1">
          <span className="text-xs text-[#F6F1E8]/70">Congestion Index (CI)</span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                congestionAnalysis.ci > 1.2
                  ? 'text-red-400'
                  : congestionAnalysis.ci > 0.9
                  ? 'text-[#F3C45B]'
                  : 'text-[#28B85B]'
              }`}
            >
              {congestionAnalysis.ci}
            </span>
            <span className="text-xs font-semibold text-[#F6F1E8]/80 font-mono">
              [{congestionAnalysis.label}]
            </span>
          </div>
          <span className="text-[11px] text-[#F6F1E8]/50 block">
            Target threshold: &lt;1.00 for zero bottlenecking
          </span>
        </div>

        {/* Metric 2: Sensor Manifold Pressure */}
        <div className="p-4 bg-[#062B25] rounded-xl border border-[#28B85B]/20 space-y-1">
          <span className="text-xs text-[#F6F1E8]/70">Compressor Pressure</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#168BDB]">
              {activeStation.dispensers[0]?.currentPressureBar || 205} bar
            </span>
            <span className="text-xs text-[#28B85B] font-mono">Nominal</span>
          </div>
          <span className="text-[11px] text-[#F6F1E8]/50 block">
            Optimal: 200–220 bar (Full cylinder pack)
          </span>
        </div>

        {/* Metric 3: Active Dispenser Units */}
        <div className="p-4 bg-[#062B25] rounded-xl border border-[#28B85B]/20 space-y-1">
          <span className="text-xs text-[#F6F1E8]/70">Active Dispenser Units</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {activeStation.dispensers.filter((d) => d.status === 'ACTIVE').length} /{' '}
              {activeStation.dispensers.length}
            </span>
          </div>
          <span className="text-[11px] text-[#F6F1E8]/50 block">
            Throughput: ~14 vehicles / 15 minutes
          </span>
        </div>

        {/* Metric 4: Physical Vehicles in Lane */}
        <div className="p-4 bg-[#062B25] rounded-xl border border-[#28B85B]/20 space-y-1">
          <span className="text-xs text-[#F6F1E8]/70">Physical Vehicles in Lane</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {activeStation.cngQueue.totalVehiclesAhead}
            </span>
            <span className="text-xs text-[#F6F1E8]/60 font-mono">
              (~{activeStation.cngQueue.estimatedWaitMinutes}m wait)
            </span>
          </div>
          <span className="text-[11px] text-[#F6F1E8]/50 block">
            {activeStation.cngQueue.breakdown.cars} cars · {activeStation.cngQueue.breakdown.autos} autos ·{' '}
            {activeStation.cngQueue.breakdown.commercial} commercial
          </span>
        </div>
      </div>

      {/* Hourly Demand Forecasting Strip (Section 22 of prompt) */}
      <div className="p-5 bg-[#062B25] rounded-xl border border-[#28B85B]/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#F3C45B]" />
            <h3 className="text-xs font-bold text-[#F6F1E8] uppercase tracking-wider">
              Visual Demand Forecasting (Evening Rush Hours)
            </h3>
          </div>
          <span className="text-[11px] text-[#F6F1E8]/60">AI Predictive Calibration</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {hourlyDemandForecast.map((item) => (
            <div key={item.hour} className="p-3 bg-[#031815] rounded-lg border border-[#062B25] space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-white">{item.hour}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${item.bg} ${item.color}`}>
                  {item.level}
                </span>
              </div>
              <div className="flex justify-between text-[#F6F1E8]/70 text-[11px] pt-1">
                <span>Queue Projection:</span>
                <span className="font-mono text-white">{item.queueTrend}</span>
              </div>
              <div className="flex justify-between text-[#F6F1E8]/70 text-[11px]">
                <span>EV Bay Load:</span>
                <span className="font-mono text-[#28B85B]">{item.bayOccupancy}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content: 60-Minute Arrival Demand Curve & Automated ATC Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 60-Minute Arrival Demand Curve */}
        <div className="lg:col-span-7 p-5 bg-[#062B25] rounded-xl border border-[#28B85B]/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#F6F1E8]/80 uppercase tracking-wider">
              Predicted Arrival Clustering (Next 60 Minutes)
            </h3>
            <span className="text-[11px] text-[#F6F1E8]/50">Auto-updated via Virtual Green Windows</span>
          </div>

          <div className="space-y-3">
            {simulatedIncoming60Min.map((slot) => {
              const maxScale = 20;
              const pct = (slot.vehicles / maxScale) * 100;
              return (
                <div key={slot.slot} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[#F6F1E8]/90">
                    <span className="font-medium">{slot.slot}</span>
                    <span className="font-mono font-bold">
                      {slot.vehicles} vehicles{' '}
                      {slot.isPeak && <span className="text-[#F3C45B] text-[10px] ml-1">(PEAK SPIKE)</span>}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[#031815] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        slot.isPeak ? 'bg-[#F3C45B]' : 'bg-[#168BDB]'
                      }`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-[#031815] rounded-lg border border-[#062B25] text-[11px] text-[#F6F1E8]/70">
            <span>Routiq Invariant: Physical dispenser constraints cannot be altered by software. Arrival staggering ensures vehicles arrive just as bays clear.</span>
          </div>
        </div>

        {/* Right: Automated De-congestion Actions */}
        <div className="lg:col-span-5 p-5 bg-[#062B25] rounded-xl border border-[#28B85B]/20 space-y-4">
          <h3 className="text-xs font-bold text-[#F6F1E8]/80 uppercase tracking-wider">
            Air-Traffic-Control Recommendations
          </h3>

          <div className="space-y-3 text-xs">
            {congestionAnalysis.ci > 1.1 ? (
              <div className="p-3.5 bg-amber-950/40 border border-[#F3C45B]/60 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-[#F3C45B] font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Incoming Arrival Spike in Window 30m–45m</span>
                </div>
                <p className="text-[#F6F1E8]/80 leading-normal">
                  Arrival demand exceeds dispenser capacity by 35%. Rerouting 3 incoming vehicles to a nearby low-congestion hub will normalize the corridor.
                </p>
                <button
                  onClick={handleRerouteVehicles}
                  className="w-full py-2 bg-[#F3C45B] hover:bg-[#F3C45B]/90 text-[#031815] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Execute Smart Corridor Reroute</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-[#031815] border border-[#28B85B]/30 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-[#28B85B] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Nominal Arrival Flow</span>
                </div>
                <p className="text-[#F6F1E8]/80 leading-normal">
                  Arrival rates match dispenser service speed (~3.8 mins per car). No manual intervention needed.
                </p>
              </div>
            )}

            <div className="p-3.5 bg-[#031815] rounded-xl border border-[#062B25] space-y-2">
              <span className="font-bold text-[#F6F1E8] block">Ghost Booking Guard</span>
              <p className="text-[#F6F1E8]/60 text-[11px] leading-normal">
                Vehicles whose GPS indicates stationary position &gt;12 mins or unrealistic approach speed (&gt;110 km/h) are automatically queried before releasing capacity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
