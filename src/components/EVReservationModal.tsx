import React, { useState } from 'react';
import { EVChargerBay, EVReservation, Station, Vehicle, Wallet } from '../types';
import { X, Zap, Calendar, Clock, ShieldCheck, QrCode, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { estimateChargingDurationMinutes, isChargerCompatible } from '../algorithms/evCompatibility';

interface EVReservationModalProps {
  station: Station;
  vehicle: Vehicle;
  wallet: Wallet;
  onClose: () => void;
  onConfirmReservation: (reservation: EVReservation) => void;
  onQuickQRCharge: (charger: EVChargerBay) => void;
}

export const EVReservationModal: React.FC<EVReservationModalProps> = ({
  station,
  vehicle,
  wallet,
  onClose,
  onConfirmReservation,
  onQuickQRCharge,
}) => {
  // Compatible chargers only
  const compatibleChargers = station.chargers.filter((c) => isChargerCompatible(vehicle, c).isCompatible);
  const [selectedCharger, setSelectedCharger] = useState<EVChargerBay>(compatibleChargers[0] || station.chargers[0]);

  const [date, setDate] = useState('Today');
  const [startTime, setStartTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [targetBatteryPct, setTargetBatteryPct] = useState(80);
  const [confirmedReservation, setConfirmedReservation] = useState<EVReservation | null>(null);

  // Charging estimation
  const currentBattery = vehicle.currentBatteryPct || 40;
  const chargingEstimates = estimateChargingDurationMinutes(
    vehicle,
    currentBattery,
    targetBatteryPct,
    selectedCharger?.maxPowerKW || 60
  );

  const estimatedUnitsKWh = chargingEstimates.energyAddedKWh;
  const estimatedCost = Math.round(estimatedUnitsKWh * (selectedCharger?.pricePerKWh || 19));
  const reservationDeposit = 150; // Booking hold amount

  const handleBook = () => {
    if (!selectedCharger) return;

    // Calculate end time
    const [hours, mins] = startTime.split(':').map(Number);
    const startMinutesTotal = hours * 60 + mins;
    const endMinutesTotal = startMinutesTotal + durationMinutes;
    const endHours = Math.floor(endMinutesTotal / 60) % 24;
    const endMins = endMinutesTotal % 60;
    const endTimeFormatted = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

    const reservation: EVReservation = {
      id: `RQ-EV-${Math.floor(100000 + Math.random() * 900000)}`,
      stationId: station.id,
      stationName: station.name,
      chargerId: selectedCharger.id,
      bayNumber: selectedCharger.bayNumber,
      connectorType: selectedCharger.connectorType,
      powerKW: selectedCharger.maxPowerKW,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      date,
      startTime,
      endTime: endTimeFormatted,
      durationMinutes,
      arrivalWindow: `${startTime} – ${endTimeFormatted}`,
      gracePeriodMinutes: 15,
      totalAmount: estimatedCost,
      status: 'CONFIRMED',
      qrCodeToken: `QR-RQ-BAY-${selectedCharger.id}-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    onConfirmReservation(reservation);
    setConfirmedReservation(reservation);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!confirmedReservation ? (
          <div className="space-y-6">
            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
                <Zap className="w-4 h-4 fill-current" />
                <span>HOTEL-GRADE CHARGING BAY RESERVATION</span>
              </div>
              <h3 className="text-xl font-bold text-white">{station.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Vehicle: <span className="text-slate-200 font-semibold">{vehicle.name}</span> ({vehicle.registrationNumber})
              </p>
            </div>

            {/* Step 1: Select Physical Bay */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                1. SELECT COMPATIBLE PHYSICAL BAY
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {compatibleChargers.map((ch) => {
                  const isSelected = selectedCharger?.id === ch.id;
                  const isAvailable = ch.status === 'AVAILABLE';

                  return (
                    <div
                      key={ch.id}
                      onClick={() => setSelectedCharger(ch)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{ch.bayNumber}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isAvailable
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {ch.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 flex items-center gap-2">
                        <span>{ch.connectorType}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-emerald-400">{ch.maxPowerKW} kW {ch.isDC ? 'DC' : 'AC'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>₹{ch.pricePerKWh}/kWh</span>
                        <span>Hardware Uptime: {ch.reliabilityScore}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Non-reservation Instant Start Option (if selected bay is free right now!) */}
            {selectedCharger?.status === 'AVAILABLE' && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-4">
                <div className="text-xs">
                  <span className="text-emerald-400 font-bold block">Bay is Open Right Now!</span>
                  <span className="text-slate-300">
                    No reservation required if you are already at the station. Tap to scan bay QR and initiate direct charge.
                  </span>
                </div>
                <button
                  onClick={() => onQuickQRCharge(selectedCharger)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg whitespace-nowrap shrink-0 transition-colors"
                >
                  Direct QR Charge
                </button>
              </div>
            )}

            {/* Step 2: Time and Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Date</label>
                <div className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-white">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <select
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-transparent border-none focus:outline-none w-full"
                  >
                    <option value="Today" className="bg-slate-900">Today</option>
                    <option value="Tomorrow" className="bg-slate-900">Tomorrow</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Start Time</label>
                <div className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-white">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-transparent border-none focus:outline-none w-full font-mono"
                  >
                    {['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'].map(
                      (t) => (
                        <option key={t} value={t} className="bg-slate-900">{t}</option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Duration</label>
                <div className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-white">
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="bg-transparent border-none focus:outline-none w-full"
                  >
                    <option value={30} className="bg-slate-900">30 min (Express)</option>
                    <option value={45} className="bg-slate-900">45 min (Standard 80%)</option>
                    <option value={60} className="bg-slate-900">60 min (Full Pack)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing & Estimation Summary */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Estimated Energy Intake ({currentBattery}% → {targetBatteryPct}%)</span>
                <span className="font-mono text-white">{estimatedUnitsKWh} kWh</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Session Time</span>
                <span className="font-mono text-white">~{chargingEstimates.totalMinutes} minutes</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Session Cost</span>
                <span className="font-mono text-white">₹{estimatedCost}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm text-white">
                <span>Reservation Security Hold</span>
                <span className="font-mono text-emerald-400">₹{reservationDeposit}</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>15-min grace window. Free cancellation up to 15 mins prior. Non-speculative.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-400">
                Wallet Balance:{' '}
                <span className="font-mono text-emerald-400 font-bold">
                  ₹{wallet.availableBalance.toFixed(0)}
                </span>
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
                  onClick={handleBook}
                  className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-lg"
                >
                  Confirm Bay Reservation
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Booking Confirmation View */
          <div className="space-y-6 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <div className="text-xs uppercase font-mono tracking-widest text-emerald-400 mb-1">
                BAY RESERVED &amp; HARDWARE LOCKED
              </div>
              <h3 className="text-2xl font-bold text-white">Reservation Confirmed</h3>
              <p className="text-xs text-slate-400 mt-1">Pass ID: {confirmedReservation.id}</p>
            </div>

            {/* QR Pass Box */}
            <div className="max-w-xs mx-auto p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="p-3 bg-white rounded-lg inline-block">
                {/* Visual SVG QR representation */}
                <div className="w-36 h-36 bg-slate-900 p-2 rounded flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-8 h-8 bg-emerald-400 rounded-sm"></div>
                    <div className="w-8 h-8 bg-emerald-400 rounded-sm"></div>
                  </div>
                  <div className="text-[10px] text-center text-emerald-300 font-mono">
                    {confirmedReservation.bayNumber}
                  </div>
                  <div className="flex justify-between">
                    <div className="w-8 h-8 bg-emerald-400 rounded-sm"></div>
                    <div className="w-8 h-8 bg-slate-700 rounded-sm"></div>
                  </div>
                </div>
              </div>

              <div className="text-xs space-y-1 text-slate-300">
                <div className="font-bold text-white text-sm">{confirmedReservation.bayNumber}</div>
                <div>{confirmedReservation.stationName}</div>
                <div className="font-mono text-emerald-400">Window: {confirmedReservation.arrivalWindow}</div>
                <div className="text-[11px] text-slate-500">Grace Period: +15 minutes</div>
              </div>
            </div>

            <div className="text-xs text-slate-400 max-w-sm mx-auto">
              Scan this pass on the physical dispenser pillar or your Routiq camera when you arrive at the bay.
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
