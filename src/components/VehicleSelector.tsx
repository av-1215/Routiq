import React, { useState } from 'react';
import { Vehicle, VehicleType, EVConnectorType, CNGVehicleCategory } from '../types';
import { Car, Zap, Fuel, Plus, Check, ChevronDown } from 'lucide-react';

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  activeVehicle: Vehicle;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onAddVehicle: (newVehicle: Vehicle) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  vehicles,
  activeVehicle,
  onSelectVehicle,
  onAddVehicle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Form state for adding custom vehicle
  const [formType, setFormType] = useState<VehicleType>('EV');
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formReg, setFormReg] = useState('');
  const [formKWh, setFormKWh] = useState(45);
  const [formRangeKm, setFormRangeKm] = useState(320);
  const [formConnector, setFormConnector] = useState<EVConnectorType>('CCS2');
  const [formCNGCat, setFormCNGCat] = useState<CNGVehicleCategory>('Car');
  const [formCNGKg, setFormCNGKg] = useState(10);

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBrand.trim()) return;

    const newVehicle: Vehicle = {
      id: `v-custom-${Date.now()}`,
      name: `${formBrand} ${formName}`,
      brand: formBrand,
      model: formName,
      type: formType,
      registrationNumber: formReg.trim() || 'IN 01 REG 9999',
      ...(formType === 'EV'
        ? {
            batteryCapacityKWh: formKWh,
            usableBatteryKWh: formKWh * 0.95,
            realWorldRangeKm: formRangeKm,
            claimedRangeKm: Math.round(formRangeKm * 1.3),
            supportedConnectors: [formConnector, 'Type 2'],
            maxDCPowerKW: 60,
            maxACPowerKW: 7.2,
            currentBatteryPct: 80,
          }
        : {
            cngCategory: formCNGCat,
            cylinderCapacityKg: formCNGKg,
            mileageKmPerKg: 30,
            tankPressureRatingBar: 200,
            currentFuelKg: formCNGKg * 0.8,
          }),
    };

    onAddVehicle(newVehicle);
    setIsAdding(false);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Active Vehicle Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-4 p-3 bg-slate-900/90 hover:bg-slate-900 border border-slate-800 rounded-xl cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
              activeVehicle.type === 'EV'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            {activeVehicle.type === 'EV' ? <Zap className="w-5 h-5 fill-current" /> : <Fuel className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{activeVehicle.name}</span>
              <span className="text-[11px] font-mono text-slate-400">{activeVehicle.registrationNumber}</span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              {activeVehicle.type === 'EV' ? (
                <>
                  <span>Battery {activeVehicle.currentBatteryPct}%</span>
                  <span aria-hidden="true">·</span>
                  <span>Real Range ~{activeVehicle.realWorldRangeKm} km</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeVehicle.supportedConnectors?.join('/')}</span>
                </>
              ) : (
                <>
                  <span>Fuel {activeVehicle.currentFuelKg} kg</span>
                  <span aria-hidden="true">·</span>
                  <span>Category: {activeVehicle.cngCategory}</span>
                  <span aria-hidden="true">·</span>
                  <span>Rating: {activeVehicle.tankPressureRatingBar} bar</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs hidden sm:inline">Change Vehicle</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-4 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Your Garage</span>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAdding ? 'Close Form' : 'Add Vehicle'}</span>
            </button>
          </div>

          {/* Add Vehicle Form */}
          {isAdding ? (
            <form onSubmit={handleCreateVehicle} className="space-y-3 mb-4 p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="formType"
                    checked={formType === 'EV'}
                    onChange={() => setFormType('EV')}
                    className="accent-emerald-500"
                  />
                  <span>EV Vehicle</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="formType"
                    checked={formType === 'CNG'}
                    onChange={() => setFormType('CNG')}
                    className="accent-cyan-500"
                  />
                  <span>CNG Vehicle</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Make / Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tata, Mahindra, MG, Maruti"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nexon EV, BE 6, Ertiga CNG"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Registration Plate</label>
                <input
                  type="text"
                  placeholder="e.g. DL 01 EV 9821"
                  value={formReg}
                  onChange={(e) => setFormReg(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono uppercase"
                />
              </div>

              {formType === 'EV' ? (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Battery (kWh)</label>
                    <input
                      type="number"
                      value={formKWh}
                      onChange={(e) => setFormKWh(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Real Range (km)</label>
                    <input
                      type="number"
                      value={formRangeKm}
                      onChange={(e) => setFormRangeKm(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Connector</label>
                    <select
                      value={formConnector}
                      onChange={(e) => setFormConnector(e.target.value as EVConnectorType)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                    >
                      <option value="CCS2">CCS2</option>
                      <option value="Type 2">Type 2</option>
                      <option value="GB/T">GB/T</option>
                      <option value="CHAdeMO">CHAdeMO</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Category</label>
                    <select
                      value={formCNGCat}
                      onChange={(e) => setFormCNGCat(e.target.value as CNGVehicleCategory)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                    >
                      <option value="Car">Car</option>
                      <option value="Auto">Auto Rickshaw</option>
                      <option value="Taxi">Taxi</option>
                      <option value="Commercial">Commercial</option>
                      <option value="SUV">SUV</option>
                      <option value="Bus">Bus</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Capacity (kg)</label>
                    <input
                      type="number"
                      value={formCNGKg}
                      onChange={(e) => setFormCNGKg(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded mt-2 transition-colors"
              >
                Save Vehicle to Garage
              </button>
            </form>
          ) : null}

          {/* List of Vehicles */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {vehicles.map((v) => {
              const isSelected = v.id === activeVehicle.id;
              return (
                <div
                  key={v.id}
                  onClick={() => {
                    onSelectVehicle(v);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-slate-800 border border-emerald-500/40 text-white'
                      : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {v.type === 'EV' ? (
                      <Zap className="w-4 h-4 text-emerald-400 fill-current" />
                    ) : (
                      <Fuel className="w-4 h-4 text-cyan-400" />
                    )}
                    <div>
                      <div className="text-xs font-semibold">{v.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {v.registrationNumber} {v.type === 'EV' ? `· ${v.batteryCapacityKWh} kWh` : `· ${v.cngCategory}`}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
