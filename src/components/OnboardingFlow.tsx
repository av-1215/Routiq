import React, { useState } from 'react';
import { Vehicle } from '../types';
import { INITIAL_VEHICLES } from '../data/mockDatabase';
import {
  Zap,
  Fuel,
  MapPin,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Navigation,
  Compass
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (preferences: {
    driveType: 'EV' | 'CNG' | 'BOTH';
    selectedVehicle: Vehicle;
    locationGranted: boolean;
    city: string;
  }) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [driveType, setDriveType] = useState<'EV' | 'CNG' | 'BOTH'>('EV');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(INITIAL_VEHICLES[3]); // Nexon EV default
  const [locationGranted, setLocationGranted] = useState<boolean>(true);
  const [city, setCity] = useState<string>('Hyderabad, Telangana');

  const evVehicles = INITIAL_VEHICLES.filter((v) => v.type === 'EV');
  const cngVehicles = INITIAL_VEHICLES.filter((v) => v.type === 'CNG');

  const handleFinish = () => {
    onComplete({
      driveType,
      selectedVehicle,
      locationGranted,
      city,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07130F] text-[#F6F1E8] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#25C269]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg bg-[#031815] border border-[#25C269]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between pb-2 border-b border-[#062B25]">
          <div className="flex items-center gap-2">
            <img
              src="/routiq_logo.png"
              alt="Routiq Logo"
              className="w-6 h-6 object-contain"
            />
            <span className="font-extrabold text-sm tracking-tight text-white">Routiq</span>
          </div>
          <span className="text-[11px] font-mono text-[#25C269] font-bold">
            Step {step} of 5
          </span>
        </div>

        {/* SCREEN 1: Welcome & Brand */}
        {step === 1 && (
          <div className="text-center space-y-6 py-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-[#07130F] border-2 border-[#25C269]/50 flex items-center justify-center shadow-xl p-2">
              <img
                src="/routiq_logo.png"
                alt="Routiq Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Routiq
              </h1>
              <p className="text-sm font-semibold text-[#25C269]">
                Smarter Routes. Greener Journeys.
              </p>
              <p className="text-xs text-[#F6F1E8]/70 max-w-xs mx-auto leading-relaxed pt-2">
                India's unified mobility layer for fast EV charging reservations, live CNG queue intelligence, and TRIPP route optimization.
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Get started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SCREEN 2: What do you drive? */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white">What do you drive?</h2>
              <p className="text-xs text-[#F6F1E8]/70">
                This personalizes your Home experience so you see what matters first.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => {
                  setDriveType('EV');
                  setSelectedVehicle(evVehicles[0]);
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  driveType === 'EV'
                    ? 'bg-[#168BDB]/15 border-2 border-[#168BDB] text-white shadow-lg'
                    : 'bg-[#07130F] border-[#062B25] text-[#F6F1E8]/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#168BDB]/20 text-[#168BDB] flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Electric Vehicle (EV)</h3>
                    <p className="text-xs text-[#F6F1E8]/60 mt-0.5">
                      Cars, 2-wheelers &amp; fleets requiring CCS2 / Type 2 charging
                    </p>
                  </div>
                </div>
                {driveType === 'EV' && <CheckCircle2 className="w-5 h-5 text-[#168BDB]" />}
              </button>

              <button
                onClick={() => {
                  setDriveType('CNG');
                  setSelectedVehicle(cngVehicles[0]);
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  driveType === 'CNG'
                    ? 'bg-[#25C269]/15 border-2 border-[#25C269] text-white shadow-lg'
                    : 'bg-[#07130F] border-[#062B25] text-[#F6F1E8]/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#25C269]/20 text-[#25C269] flex items-center justify-center font-bold">
                    <Fuel className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">CNG Vehicle</h3>
                    <p className="text-xs text-[#F6F1E8]/60 mt-0.5">
                      Cars, taxis &amp; auto-rickshaws requiring low-queue stations
                    </p>
                  </div>
                </div>
                {driveType === 'CNG' && <CheckCircle2 className="w-5 h-5 text-[#25C269]" />}
              </button>

              <button
                onClick={() => {
                  setDriveType('BOTH');
                  setSelectedVehicle(evVehicles[0]);
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  driveType === 'BOTH'
                    ? 'bg-[#07130F] border-2 border-[#25C269] text-white shadow-lg'
                    : 'bg-[#07130F] border-[#062B25] text-[#F6F1E8]/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#25C269]/20 text-[#25C269] flex items-center justify-center font-bold">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">I use both / Fleet operator</h3>
                    <p className="text-xs text-[#F6F1E8]/60 mt-0.5">
                      Switch seamlessly between EV chargers and CNG queue intelligence
                    </p>
                  </div>
                </div>
                {driveType === 'BOTH' && <CheckCircle2 className="w-5 h-5 text-[#25C269]" />}
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl border border-[#062B25] text-xs font-semibold text-[#F6F1E8]/70 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 3: Your vehicle */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white">Select your vehicle</h2>
                <p className="text-xs text-[#F6F1E8]/70">
                  Select your model for accurate battery range and connector matching.
                </p>
              </div>
              <button
                onClick={() => setStep(4)}
                className="text-xs font-bold text-[#25C269] hover:underline"
              >
                Skip for now
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {(driveType === 'CNG' ? cngVehicles : evVehicles).map((veh) => {
                const isSelected = selectedVehicle.id === veh.id;
                return (
                  <div
                    key={veh.id}
                    onClick={() => setSelectedVehicle(veh)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#07130F] border-2 border-[#25C269] shadow-md'
                        : 'bg-[#07130F]/60 border-[#062B25] hover:border-[#25C269]/30'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white text-xs">{veh.name}</div>
                      <div className="text-[11px] text-[#F6F1E8]/60 mt-0.5">
                        {veh.type === 'EV'
                          ? `${veh.batteryCapacityKWh} kWh · ${veh.supportedConnectors?.join(', ')} · ~${veh.realWorldRangeKm} km range`
                          : `${veh.cylinderCapacityKg} kg cylinder · ~${veh.mileageKmPerKg} km/kg · ${veh.cngCategory}`}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#25C269] shrink-0" />}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-3 rounded-xl border border-[#062B25] text-xs font-semibold text-[#F6F1E8]/70 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-3 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 4: Location access (Optional) */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="text-center space-y-3 py-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#25C269]/15 border border-[#25C269]/30 flex items-center justify-center text-[#25C269]">
                <MapPin className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-extrabold text-white">Enable location access</h2>
              <p className="text-xs text-[#F6F1E8]/70 max-w-sm mx-auto leading-relaxed">
                Helps Routiq find nearby stations, monitor live queues in your corridor, and calculate precise driving times.
              </p>
            </div>

            <div className="p-3.5 bg-[#07130F] rounded-2xl border border-[#062B25] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F6F1E8]/60 block">
                Primary Operating City
              </span>
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#25C269]" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#031815] px-3 py-1.5 rounded-lg border border-[#062B25] text-xs font-semibold text-white focus:outline-none focus:border-[#25C269]"
                />
              </div>
              <p className="text-[10px] text-[#F6F1E8]/50">
                You can change this anytime from the Header or Profile.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setLocationGranted(true);
                  setStep(5);
                }}
                className="w-full py-3 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Allow Location Access</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setLocationGranted(false);
                  setStep(5);
                }}
                className="w-full py-2.5 bg-transparent hover:bg-[#07130F] text-[#F6F1E8]/60 hover:text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Enter Location Manually Instead
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 5: Ready to launch */}
        {step === 5 && (
          <div className="text-center space-y-6 py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#25C269]/20 text-[#25C269] flex items-center justify-center border-2 border-[#25C269]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-white">You're all set!</h2>
              <p className="text-xs text-[#25C269] font-medium">
                Personalized for your {selectedVehicle.name} in {city.split(',')[0]}
              </p>
              <p className="text-xs text-[#F6F1E8]/70 max-w-xs mx-auto leading-relaxed pt-2">
                Home will show simple recommendations. Explore, TRIPP and Community are just one tap away.
              </p>
            </div>

            <div className="p-3 bg-[#07130F] rounded-xl border border-[#062B25] text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#F6F1E8]/60">Vehicle:</span>
                <span className="font-bold text-white">{selectedVehicle.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F6F1E8]/60">Mode:</span>
                <span className="font-bold text-[#25C269]">
                  {driveType === 'EV' ? '⚡ EV Focus' : driveType === 'CNG' ? '⛽ CNG Focus' : 'Dual Mobility'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F6F1E8]/60">Region:</span>
                <span className="font-bold text-white">{city}</span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3.5 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Enter Routiq</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
