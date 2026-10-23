import React, { useState } from 'react';
import { EVChargerBay, Station, Vehicle } from '../types';
import { X, QrCode, Zap, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface QRScannerModalProps {
  onClose: () => void;
  stations: Station[];
  vehicle: Vehicle;
  onSessionStarted: (chargerId: string, stationName: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  onClose,
  stations,
  vehicle,
  onSessionStarted,
}) => {
  const [scannedCharger, setScannedCharger] = useState<{
    charger: EVChargerBay;
    station: Station;
  } | null>(null);

  const [isScanning, setIsScanning] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  // Quick preset QR simulation targets
  const handleSimulateScan = (stationId: string, bayNumber: string) => {
    const station = stations.find((s) => s.id === stationId);
    if (!station) return;
    const charger = station.chargers.find((c) => c.bayNumber.includes(bayNumber)) || station.chargers[0];
    if (!charger) return;

    setScannedCharger({ charger, station });
    setIsScanning(false);
  };

  const handleStartCharging = () => {
    if (!scannedCharger) return;
    setConfirmed(true);
    setTimeout(() => {
      onSessionStarted(scannedCharger.charger.id, scannedCharger.station.name);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400">
            <QrCode className="w-4 h-4" />
            <span>DISPENSER HARDWARE SCANNER</span>
          </div>
          <h3 className="text-xl font-bold text-white">Scan Physical Pillar QR</h3>
          <p className="text-xs text-slate-400">
            Point camera at the QR code on the EV charger gun holster or CNG dispenser pillar.
          </p>

          {/* Camera Viewfinder Mock */}
          {isScanning ? (
            <div className="relative w-64 h-64 mx-auto rounded-2xl bg-slate-950 border-2 border-dashed border-emerald-500/50 flex items-center justify-center overflow-hidden">
              {/* Laser scan line animation */}
              <div className="absolute inset-x-0 h-1 bg-emerald-400 shadow-[0_0_12px_#10b981] animate-bounce"></div>

              <div className="p-4 text-center space-y-2 pointer-events-none opacity-40">
                <QrCode className="w-24 h-24 mx-auto text-emerald-400" />
                <span className="text-[10px] text-slate-400 block font-mono">ALIGN IDENTIFIER CODE</span>
              </div>
            </div>
          ) : scannedCharger ? (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">HARDWARE VERIFIED</span>
                <span className="font-mono text-xs text-slate-400">{scannedCharger.charger.connectorType}</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{scannedCharger.charger.bayNumber}</h4>
                <div className="text-xs text-slate-400">{scannedCharger.station.name}</div>
              </div>
              <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
                <span>Output Capacity</span>
                <span className="font-mono font-bold text-white">{scannedCharger.charger.maxPowerKW} kW DC Fast</span>
              </div>
              <div className="text-xs text-slate-300 flex items-center justify-between">
                <span>Tariff Rate</span>
                <span className="font-mono font-bold text-white">₹{scannedCharger.charger.pricePerKWh}/kWh</span>
              </div>
            </div>
          ) : null}

          {/* Simulation Quick Clicks */}
          {isScanning && (
            <div className="space-y-2 pt-2 text-xs">
              <span className="text-slate-500 block text-[11px]">Or test-simulate scanning a live pillar:</span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleSimulateScan('st-ggn-cyberhub', 'Bay 01')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-left flex items-center justify-between"
                >
                  <span>Cyber City Hub · Bay 01 (120 kW)</span>
                  <span className="text-emerald-400 font-mono text-[11px]">Scan</span>
                </button>
                <button
                  onClick={() => handleSimulateScan('st-nh48-neemrana', 'Bay 01')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-left flex items-center justify-between"
                >
                  <span>Neemrana Midway · Bay 01 (150 kW)</span>
                  <span className="text-emerald-400 font-mono text-[11px]">Scan</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          {scannedCharger && !confirmed && (
            <div className="space-y-2 pt-2">
              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Explicit authorization required before power delivery.</span>
              </div>
              <button
                onClick={handleStartCharging}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-lg"
              >
                Confirm Vehicle &amp; Initiate Session
              </button>
            </div>
          )}

          {confirmed && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500 text-emerald-300 rounded-lg text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Session Initialized! Dispenser relay closed.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
