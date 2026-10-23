import React, { useState } from 'react';
import { Station, EVChargerBay, CNGDispenser } from '../types';
import {
  Building2,
  Zap,
  Fuel,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gauge,
  Megaphone,
  X,
  Power,
  RotateCw,
  Send,
  Users
} from 'lucide-react';

interface OperatorDashboardModalProps {
  stations: Station[];
  onClose: () => void;
  onUpdateStationCharger: (stationId: string, chargerId: string, newStatus: EVChargerBay['status']) => void;
  onUpdateCNGQueue: (stationId: string, deltaWait: number) => void;
  onBroadcastAnnouncement: (stationId: string, announcement: string) => void;
}

export const OperatorDashboardModal: React.FC<OperatorDashboardModalProps> = ({
  stations,
  onClose,
  onUpdateStationCharger,
  onUpdateCNGQueue,
  onBroadcastAnnouncement,
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>(
    stations[1]?.id || stations[0]?.id || ''
  );
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  const activeStation = stations.find((s) => s.id === selectedStationId) || stations[0];

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    onBroadcastAnnouncement(activeStation.id, announcementText.trim());
    setAnnouncementSuccess(true);
    setTimeout(() => {
      setAnnouncementSuccess(false);
      setAnnouncementText('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#07130F] border-2 border-[#25C269]/40 rounded-3xl max-w-4xl w-full p-5 sm:p-8 space-y-6 shadow-2xl text-xs text-[#F6F1E8]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#062B25] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25C269]/20 text-[#25C269] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">
                  Routiq Operator Command Center
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#25C269]/15 text-[#25C269] text-[10px] font-mono font-bold">
                  SCADA SC-849 Active
                </span>
              </div>
              <p className="text-[11px] text-[#F6F1E8]/70 mt-0.5">
                Real-time dispenser hardware control, virtual queue regulation &amp; community alerts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#031815] text-[#F6F1E8]/60 hover:text-white border border-[#062B25] self-start sm:self-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Station Selector Dropdown */}
        <div className="flex items-center justify-between gap-4 p-3 bg-[#031815] rounded-xl border border-[#062B25]">
          <span className="text-[11px] font-bold text-[#F6F1E8]/60 uppercase">
            Active Operating Hub:
          </span>
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="bg-[#07130F] text-white font-bold p-2 rounded-lg border border-[#25C269]/30 text-xs focus:outline-none"
          >
            {stations.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.brand} · {st.type})
              </option>
            ))}
          </select>
        </div>

        {/* Hardware Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Column 1: EV Chargers Control */}
          <div className="p-4 bg-[#031815] rounded-2xl border border-[#062B25] space-y-3">
            <div className="flex items-center justify-between border-b border-[#062B25] pb-2">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Zap className="w-4 h-4 text-[#168BDB]" />
                <span>EV Charger Bays ({activeStation.chargers.length})</span>
              </div>
              <span className="text-[10px] text-[#F6F1E8]/50 font-mono">
                OCPI 2.2 Connected
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {activeStation.chargers.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-xl bg-[#07130F] border border-[#062B25] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{c.bayNumber}</span>
                    <span className="text-[10px] text-[#F6F1E8]/60 font-mono">
                      {c.maxPowerKW} kW {c.connectorType}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        c.status === 'AVAILABLE'
                          ? 'bg-[#25C269]/20 text-[#25C269]'
                          : c.status === 'OCCUPIED'
                          ? 'bg-[#168BDB]/20 text-[#168BDB]'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {c.status}
                    </span>

                    <button
                      onClick={() =>
                        onUpdateStationCharger(
                          activeStation.id,
                          c.id,
                          c.status === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE'
                        )
                      }
                      className="px-2 py-1 bg-[#031815] hover:bg-[#062B25] text-[10px] font-bold text-[#F6F1E8] rounded border border-[#062B25] transition-colors"
                      title="Toggle Bay State"
                    >
                      Toggle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: CNG Pressure & Queue Regulation */}
          <div className="p-4 bg-[#031815] rounded-2xl border border-[#062B25] space-y-3">
            <div className="flex items-center justify-between border-b border-[#062B25] pb-2">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Fuel className="w-4 h-4 text-[#25C269]" />
                <span>CNG Dispensers &amp; Queue</span>
              </div>
              <span className="text-[10px] text-[#25C269] font-mono">
                Telemetry 215 Bar
              </span>
            </div>

            <div className="p-3 bg-[#07130F] rounded-xl border border-[#062B25] space-y-2 text-center">
              <span className="text-[10px] text-[#F6F1E8]/50 uppercase block">
                Current Estimated Queue
              </span>
              <div className="text-2xl font-black font-mono text-white">
                {activeStation.cngQueue.estimatedWaitMinutes} min
              </div>
              <p className="text-[10px] text-[#F6F1E8]/60">
                {activeStation.cngQueue.totalVehiclesAhead} vehicles currently in line
              </p>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => onUpdateCNGQueue(activeStation.id, -5)}
                  className="px-3 py-1 bg-[#25C269]/20 hover:bg-[#25C269]/30 text-[#25C269] font-bold rounded-lg border border-[#25C269]/30 text-xs"
                >
                  -5 min queue
                </button>
                <button
                  onClick={() => onUpdateCNGQueue(activeStation.id, +10)}
                  className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold rounded-lg border border-amber-500/30 text-xs"
                >
                  +10 min surge
                </button>
              </div>
            </div>

            <div className="text-[10px] text-[#F6F1E8]/60 flex items-center justify-between pt-1">
              <span>Dispensers Online: {activeStation.dispensers.length} Active</span>
              <span>PNGRB Compliance: 100% Pass</span>
            </div>
          </div>
        </div>

        {/* Broadcast Operator Announcement */}
        <form onSubmit={handleBroadcast} className="p-4 bg-[#031815] rounded-2xl border border-[#062B25] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Megaphone className="w-4 h-4 text-[#25C269]" />
              <span>Broadcast Real-Time Station Announcement</span>
            </div>
            {announcementSuccess && (
              <span className="text-[10px] text-[#25C269] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pushed to Community &amp; Station Page</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="e.g. Bay 02 maintenance complete; Extra auto-rickshaw lane opened..."
              className="w-full bg-[#07130F] px-3.5 py-2 rounded-xl border border-[#062B25] focus:border-[#25C269] text-xs text-white focus:outline-none placeholder-[#F6F1E8]/40"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-bold rounded-xl whitespace-nowrap shadow transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
