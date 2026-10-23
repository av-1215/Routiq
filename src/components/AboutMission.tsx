import React, { useState } from 'react';
import { FutureInitiative, UserMobilityProfile } from '../types';
import routiqLogoImg from '../assets/images/routiq_brand_logo_1792691887296.jpg';
import {
  Bus,
  Car,
  Building2,
  Leaf,
  Bot,
  Zap,
  CheckCircle2,
  Shield,
  TrendingDown,
  Clock,
  Sparkles,
  Award,
  Save,
  Globe2,
  Users
} from 'lucide-react';

interface AboutMissionProps {
  userProfile: UserMobilityProfile;
  onUpdateProfile: (updated: UserMobilityProfile) => void;
  futureInitiatives: FutureInitiative[];
}

export const AboutMission: React.FC<AboutMissionProps> = ({
  userProfile,
  onUpdateProfile,
  futureInitiatives,
}) => {
  const [formData, setFormData] = useState<UserMobilityProfile>(userProfile);
  const [isSaved, setIsSaved] = useState(false);
  const [activeInitiativeTab, setActiveInitiativeTab] = useState<string>('all');

  const handleInputChange = (field: keyof UserMobilityProfile, value: any) => {
    setFormData((prev: UserMobilityProfile) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Dynamically calculate updated impact
    const km = formData.dailyCommuteKm || 30;
    const isEV = formData.vehicleType.startsWith('EV');
    const factorCO2 = isEV ? 0.14 : 0.08; // kg CO2 per km vs petrol
    const fuelSavingsINR = isEV ? km * 30 * 4.2 : km * 30 * 2.8;
    const queueMinsSaved = Math.round(km * 0.7 * 8);

    const updatedProfile: UserMobilityProfile = {
      ...formData,
      calculatedImpact: {
        co2SavedKg: Math.round(km * 30 * factorCO2 * 10) / 10,
        moneySavedINR: Math.round(fuelSavingsINR),
        queueMinutesSaved: queueMinsSaved,
      },
    };

    onUpdateProfile(updatedProfile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const getInitiativeIcon = (name: string) => {
    switch (name) {
      case 'Bus':
        return <Bus className="w-5 h-5 text-[#28B85B]" />;
      case 'Car':
        return <Car className="w-5 h-5 text-[#168BDB]" />;
      case 'Building2':
        return <Building2 className="w-5 h-5 text-[#28B85B]" />;
      case 'Leaf':
        return <Leaf className="w-5 h-5 text-[#28B85B]" />;
      case 'Bot':
        return <Bot className="w-5 h-5 text-[#168BDB]" />;
      case 'Zap':
      default:
        return <Zap className="w-5 h-5 text-[#F3C45B]" />;
    }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Brand Hero Card */}
      <div className="bg-[#062B25] border border-[#28B85B]/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#28B85B] uppercase tracking-wider">
              <span>Mission &amp; Platform Architecture</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#F6F1E8]/60 font-normal">India-First Smart Mobility</span>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={routiqLogoImg}
                alt="Routiq Logo"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-contain bg-[#031815] p-1.5 border border-[#28B85B]/40 shadow-md shrink-0"
              />
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F6F1E8] tracking-tight">
                  Routiq
                </h1>
                <p className="text-base sm:text-lg font-medium text-[#28B85B]">
                  Smarter Routes. Greener Journeys.
                </p>
              </div>
            </div>

            <p className="text-sm text-[#F6F1E8]/80 leading-relaxed max-w-2xl">
              Routiq is engineered to solve the real-world friction of Indian zero-emission transit. We integrate physical EV bay locking with SCADA-monitored CNG de-congestion algorithms and TRIPP predictive routing, ensuring you never waste an hour idling at a broken charger or a congested gas queue.
            </p>
          </div>

          {/* Quick Impact Stats */}
          <div className="md:col-span-4 bg-[#031815]/80 p-5 rounded-xl border border-[#28B85B]/20 space-y-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F3C45B] block">
              Your Verified Impact
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#062B25]">
                <span className="text-[#F6F1E8]/70">Monthly CO2 Prevented</span>
                <span className="font-mono font-bold text-[#28B85B] text-sm">
                  {userProfile.calculatedImpact.co2SavedKg} kg
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#062B25]">
                <span className="text-[#F6F1E8]/70">Monthly Fuel Bill Saved</span>
                <span className="font-mono font-bold text-[#F6F1E8] text-sm">
                  ₹{userProfile.calculatedImpact.moneySavedINR.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#F6F1E8]/70">Station Queue Avoided</span>
                <span className="font-mono font-bold text-[#168BDB] text-sm">
                  {userProfile.calculatedImpact.queueMinutesSaved} mins
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Layout: Values & Aims (Left) + Interactive User Profile Form (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Core Values & The Routiq Equation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#062B25]/60 border border-[#28B85B]/20 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#F6F1E8] flex items-center gap-2 uppercase tracking-wider">
              <Award className="w-4 h-4 text-[#28B85B]" />
              <span>Core Values &amp; Product Aims</span>
            </h3>

            <div className="space-y-3.5 text-xs text-[#F6F1E8]/80 leading-relaxed">
              <div className="p-3 bg-[#031815] rounded-lg border border-[#062B25] space-y-1">
                <span className="font-bold text-[#28B85B] block text-xs">
                  1. The Routiq Equation: Total Journey Time
                </span>
                <p className="font-mono text-[11px] text-[#F3C45B]">
                  Total Trip Time = Travel Time + Expected Queue Time + Refuelling Time
                </p>
                <p className="text-[11px] text-[#F6F1E8]/70 pt-0.5">
                  We don't merely point to the nearest physical coordinate. A station 1.2 km away with a 35-min queue is vastly inferior to a station 2.1 km away with a 7-min queue. Routiq prioritizes your time.
                </p>
              </div>

              <div className="p-3 bg-[#031815] rounded-lg border border-[#062B25] space-y-1">
                <span className="font-bold text-[#168BDB] block text-xs">
                  2. Physical Realities Over Virtual Promises
                </span>
                <p className="text-[11px] text-[#F6F1E8]/70">
                  A software ticket cannot conjure extra CNG dispensers into existence. Rather than selling false fast-track passes, Routiq dynamically staggers arrivals through predictive Virtual Green Windows, actively de-congesting the corridor.
                </p>
              </div>

              <div className="p-3 bg-[#031815] rounded-lg border border-[#062B25] space-y-1">
                <span className="font-bold text-[#F3C45B] block text-xs">
                  3. Indian Climate &amp; Grid Sensitivity
                </span>
                <p className="text-[11px] text-[#F6F1E8]/70">
                  Our range models factor in 38°C ambient highway heat, battery cooling degradation, and manifold compressor pressure dips below 180 bar. Real-world mobility requires real-world physics.
                </p>
              </div>
            </div>
          </div>

          {/* Environmental Mission Pledge */}
          <div className="p-4 bg-[#031815] border border-[#28B85B]/30 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#28B85B] font-semibold">
              <Leaf className="w-4 h-4" />
              <span>Environmental Responsibility Pledge</span>
            </div>
            <p className="text-[#F6F1E8]/70 leading-relaxed text-[11px]">
              Every reroute recommended by Routiq is benchmarked against real grid emission curves. By redirecting EV charging towards peak solar hours and eliminating idling CNG queues, we remove metric tons of tailpipe and compressor emissions each month.
            </p>
          </div>
        </div>

        {/* Right Column: User Data Column (Fill Your Data) */}
        <div className="lg:col-span-7">
          <div className="bg-[#062B25]/70 border border-[#28B85B]/30 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#28B85B]/20">
              <div>
                <h3 className="text-base font-bold text-[#F6F1E8]">
                  Personal Mobility Profile
                </h3>
                <p className="text-xs text-[#F6F1E8]/60">
                  Customize your commuter settings to calibrate personalized TRIPP routing and carbon accounting.
                </p>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#28B85B]/20 text-[#28B85B] font-bold">
                Profile Active
              </span>
            </div>

            {isSaved && (
              <div className="p-3 bg-[#28B85B]/20 border border-[#28B85B] text-[#28B85B] rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Your mobility preferences have been saved and applied to TRIPP!</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#F6F1E8]/80 font-medium block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full bg-[#031815] border border-[#062B25] focus:border-[#28B85B] rounded-lg p-2.5 text-[#F6F1E8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#F6F1E8]/80 font-medium block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-[#031815] border border-[#062B25] focus:border-[#28B85B] rounded-lg p-2.5 text-[#F6F1E8] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[#F6F1E8]/80 font-medium block mb-1">Primary City</label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full bg-[#031815] border border-[#062B25] focus:border-[#28B85B] rounded-lg p-2.5 text-[#F6F1E8] focus:outline-none"
                  >
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Pune">Pune</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#F6F1E8]/80 font-medium block mb-1">Commuter Persona</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full bg-[#031815] border border-[#062B25] focus:border-[#28B85B] rounded-lg p-2.5 text-[#F6F1E8] focus:outline-none"
                  >
                    <option value="COMMUTER">Daily City Commuter</option>
                    <option value="CAB_DRIVER">Ride-Hail / Taxi Driver</option>
                    <option value="FLEET_OPERATOR">Commercial Fleet Manager</option>
                    <option value="HIGHWAY_TRAVELER">Frequent Highway Driver</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#F6F1E8]/80 font-medium block mb-1">Vehicle Category</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                    className="w-full bg-[#031815] border border-[#062B25] focus:border-[#28B85B] rounded-lg p-2.5 text-[#F6F1E8] focus:outline-none"
                  >
                    <option value="EV_CAR">EV Car (Nexon/Curvv/BE 6)</option>
                    <option value="EV_SCOOTER">EV Scooter (Ather/Ola)</option>
                    <option value="CNG_CAR">CNG Car (WagonR/Ertiga)</option>
                    <option value="CNG_AUTO">CNG Auto-Rickshaw</option>
                    <option value="FLEET_VEHICLE">Fleet Commercial Truck/Cab</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#F6F1E8]/80 font-medium block mb-1">
                    Daily Transit Mileage (km/day)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={formData.dailyCommuteKm}
                    onChange={(e) => handleInputChange('dailyCommuteKm', Number(e.target.value))}
                    className="w-full bg-[#031815] border border-[#062B25] focus:border-[#28B85B] rounded-lg p-2.5 text-[#F6F1E8] font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#F6F1E8]/80 font-medium block mb-1">
                    Monthly Carbon Offset Goal (kg CO2)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={formData.targetCO2OffsetKg}
                    onChange={(e) => handleInputChange('targetCO2OffsetKg', Number(e.target.value))}
                    className="w-full bg-[#031815] border border-[#062B25] focus:border-[#28B85B] rounded-lg p-2.5 text-[#F6F1E8] font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Advanced Synergy Toggles */}
              <div className="pt-2 space-y-2.5 border-t border-[#062B25]">
                <label className="flex items-start gap-3 p-2.5 bg-[#031815] rounded-lg cursor-pointer border border-[#062B25] hover:border-[#28B85B]/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.smartGridOptIn}
                    onChange={(e) => handleInputChange('smartGridOptIn', e.target.checked)}
                    className="mt-0.5 accent-[#28B85B] w-4 h-4 rounded"
                  />
                  <div>
                    <span className="font-semibold text-[#F6F1E8] block text-xs">
                      Opt-in to Smart-Grid Off-Peak Charging Dispatches
                    </span>
                    <span className="text-[11px] text-[#F6F1E8]/60">
                      Routiq will prioritize charging bays during solar grid surplus hours, enabling up to 22% tariff savings on state DISCOMs.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-2.5 bg-[#031815] rounded-lg cursor-pointer border border-[#062B25] hover:border-[#28B85B]/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.publicTransitSynergyOptIn}
                    onChange={(e) => handleInputChange('publicTransitSynergyOptIn', e.target.checked)}
                    className="mt-0.5 accent-[#28B85B] w-4 h-4 rounded"
                  />
                  <div>
                    <span className="font-semibold text-[#F6F1E8] block text-xs">
                      Public Transit &amp; Metro Park-and-Charge Synchronization
                    </span>
                    <span className="text-[11px] text-[#F6F1E8]/60">
                      Enables multi-modal first/last-mile routing connecting EV feeder autos with city metro interchanges (e.g. Hyderabad Metro).
                    </span>
                  </div>
                </label>
              </div>

              <div>
                <label className="text-[#F6F1E8]/80 font-medium block mb-1">
                  Mobility Notes &amp; Preferred Corridor
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="e.g. Daily commute between Hitec City and Financial District..."
                  className="w-full bg-[#031815] border border-[#062B25] focus:border-[#28B85B] rounded-lg p-2.5 text-[#F6F1E8] text-xs focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#28B85B] hover:bg-[#28B85B]/90 text-[#031815] font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Update My Data &amp; Recalculate Impact</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Future Initiatives & Scalability Section (Required Features) */}
      <div className="space-y-4 pt-4 border-t border-[#28B85B]/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F6F1E8]">
              Future Initiatives &amp; Scalability Framework
            </h2>
            <p className="text-xs text-[#F6F1E8]/60">
              How Routiq scales beyond today's refueling points into a nationwide intelligent transit operating system.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-[#F6F1E8]/60">Architecture:</span>
            <span className="font-mono text-[11px] text-[#28B85B] font-bold">OCPI 2.2 · OpenADR · GTFS-RT</span>
          </div>
        </div>

        {/* 6 Grid Cards for Scalable Initiatives */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {futureInitiatives.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-[#062B25]/50 border border-[#28B85B]/20 hover:border-[#28B85B]/50 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-[#031815] border border-[#062B25]">
                    {getInitiativeIcon(item.iconName)}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-[#031815] text-[#28B85B] border border-[#28B85B]/30">
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#F6F1E8]">
                  {item.title}
                </h4>

                <p className="text-xs text-[#F6F1E8]/80 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#062B25] text-[11px]">
                <div>
                  <span className="text-[#28B85B] font-semibold block">Scalability Engine:</span>
                  <span className="text-[#F6F1E8]/60 leading-normal">{item.scalabilitySpec}</span>
                </div>
                <div>
                  <span className="text-[#168BDB] font-semibold block">Indian Context:</span>
                  <span className="text-[#F6F1E8]/60 leading-normal">{item.indianContext}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
