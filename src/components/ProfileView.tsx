import React, { useState } from 'react';
import { UserMobilityProfile, Vehicle, FutureInitiative, EVConnectorType } from '../types';
import { BatteryHealthSection } from './BatteryHealthSection';
import {
  User,
  Car,
  Zap,
  Fuel,
  Wallet,
  Star,
  ShieldCheck,
  Bell,
  MapPin,
  ChevronRight,
  Info,
  Sparkles,
  Award,
  Edit2,
  Check,
  Plus,
  LogOut,
  Users,
  Settings,
  Bookmark,
  Eye,
  Sliders,
  X,
  Mail,
  Phone,
  Compass,
  FileText
} from 'lucide-react';

export interface UserProfileItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  avatarInitials: string;
  tier: string;
  rating: number;
  walletBalance: number;
  primaryVehicleId: string;
  drivePreference: 'EV' | 'CNG' | 'BOTH';
  dailyCommuteKm: number;
  bioNotes: string;
}

const DEFAULT_PROFILES: UserProfileItem[] = [
  {
    id: 'prof-aakash',
    name: 'Aakash Varier',
    phone: '+91 98765 43210',
    email: 'aakashvarier0@gmail.com',
    city: 'Hyderabad, Telangana',
    avatarInitials: 'AV',
    tier: 'Eco Champion Tier 4',
    rating: 4.9,
    walletBalance: 850,
    primaryVehicleId: 'ev-nexon-empowered',
    drivePreference: 'EV',
    dailyCommuteKm: 42,
    bioNotes: 'Daily EV commuter navigating Outer Ring Road and Financial District corridors.',
  },
  {
    id: 'prof-sharma-family',
    name: 'Sharma Family (Shared)',
    phone: '+91 98111 22334',
    email: 'sharma.home@gmail.com',
    city: 'Hyderabad, Telangana',
    avatarInitials: 'SF',
    tier: 'Family Commuter Tier 2',
    rating: 4.8,
    walletBalance: 1420,
    primaryVehicleId: 'cng-wagonr',
    drivePreference: 'CNG',
    dailyCommuteKm: 28,
    bioNotes: 'Dual household vehicle setup optimized for school drop-offs and weekend road trips.',
  },
  {
    id: 'prof-fleet-hyd',
    name: 'Hyderabad Green Fleet',
    phone: '+91 94400 99881',
    email: 'dispatch@greenfleethyd.in',
    city: 'Cyberabad, Telangana',
    avatarInitials: 'GF',
    tier: 'Commercial Fleet Operator',
    rating: 4.95,
    walletBalance: 4890,
    primaryVehicleId: 'cng-ertiga',
    drivePreference: 'BOTH',
    dailyCommuteKm: 180,
    bioNotes: 'Dedicated green mobility fleet dispatch covering RGIA Airport corridor runs.',
  },
];

interface ProfileViewProps {
  userProfile: UserMobilityProfile;
  vehicles: Vehicle[];
  activeVehicle: Vehicle;
  onSelectVehicle: (v: Vehicle) => void;
  onAddVehicle?: (v: Vehicle) => void;
  onUpdateVehicle?: (v: Vehicle) => void;
  futureInitiatives: FutureInitiative[];
  onOpenWallet: () => void;
  onRestartOnboarding?: () => void;
  onLogout?: () => void;
  onUpdateUserProfile?: (updated: { name?: string; email?: string; city?: string; phone?: string }) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  vehicles,
  activeVehicle,
  onSelectVehicle,
  onAddVehicle,
  onUpdateVehicle,
  futureInitiatives,
  onOpenWallet,
  onRestartOnboarding,
  onLogout,
  onUpdateUserProfile,
}) => {
  // Profiles state
  const [profiles, setProfiles] = useState<UserProfileItem[]>(DEFAULT_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string>('prof-aakash');

  // Sub-tabs in profile
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BATTERY_HEALTH' | 'GARAGE' | 'PREFERENCES'>('OVERVIEW');

  // Modals & form state
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isNewProfileOpen, setIsNewProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState<FutureInitiative | null>(null);

  // Edit Profile form inputs
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editTier, setEditTier] = useState('');
  const [editDailyCommute, setEditDailyCommute] = useState<number>(45);
  const [editBioNotes, setEditBioNotes] = useState('');
  const [editDrivePreference, setEditDrivePreference] = useState<'EV' | 'CNG' | 'BOTH'>('EV');

  // Quick inline name edit
  const [isInlineNameEditing, setIsInlineNameEditing] = useState(false);
  const [inlineNameVal, setInlineNameVal] = useState('');

  // New vehicle form inputs
  const [newVehName, setNewVehName] = useState('');
  const [newVehType, setNewVehType] = useState<'EV' | 'CNG'>('EV');
  const [newVehReg, setNewVehReg] = useState('');
  const [newVehCapacity, setNewVehCapacity] = useState('45');
  const [newVehConnector, setNewVehConnector] = useState<EVConnectorType>('CCS2');

  // New profile form inputs
  const [newProfName, setNewProfName] = useState('');
  const [newProfPhone, setNewProfPhone] = useState('');
  const [newProfType, setNewProfType] = useState<'EV' | 'CNG' | 'BOTH'>('EV');

  // Active profile helper
  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const handleOpenEditProfile = () => {
    setEditName(currentProfile.name);
    setEditPhone(currentProfile.phone);
    setEditEmail(currentProfile.email);
    setEditCity(currentProfile.city);
    setEditTier(currentProfile.tier);
    setEditDailyCommute(currentProfile.dailyCommuteKm || 45);
    setEditBioNotes(currentProfile.bioNotes || '');
    setEditDrivePreference(currentProfile.drivePreference);
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    const updatedProfiles = profiles.map((p) => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          name: editName.trim(),
          phone: editPhone.trim(),
          email: editEmail.trim(),
          city: editCity.trim(),
          tier: editTier.trim(),
          dailyCommuteKm: Number(editDailyCommute) || 45,
          bioNotes: editBioNotes.trim(),
          drivePreference: editDrivePreference,
          avatarInitials: editName.trim().slice(0, 2).toUpperCase(),
        };
      }
      return p;
    });

    setProfiles(updatedProfiles);
    setIsEditProfileOpen(false);

    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        name: editName.trim(),
        email: editEmail.trim(),
        city: editCity.trim(),
        phone: editPhone.trim(),
      });
    }
  };

  const handleSaveInlineName = () => {
    if (!inlineNameVal.trim()) {
      setIsInlineNameEditing(false);
      return;
    }
    const updatedProfiles = profiles.map((p) => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          name: inlineNameVal.trim(),
          avatarInitials: inlineNameVal.trim().slice(0, 2).toUpperCase(),
        };
      }
      return p;
    });
    setProfiles(updatedProfiles);
    setIsInlineNameEditing(false);
    if (onUpdateUserProfile) {
      onUpdateUserProfile({ name: inlineNameVal.trim() });
    }
  };

  const handleSwitchProfile = (prof: UserProfileItem) => {
    setActiveProfileId(prof.id);
    const matchedVeh = vehicles.find((v) => v.id === prof.primaryVehicleId);
    if (matchedVeh) {
      onSelectVehicle(matchedVeh);
    }
    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        name: prof.name,
        email: prof.email,
        city: prof.city,
        phone: prof.phone,
      });
    }
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfName.trim()) return;
    const newProf: UserProfileItem = {
      id: `prof-${Date.now()}`,
      name: newProfName.trim(),
      phone: newProfPhone.trim() || '+91 98765 00000',
      email: `${newProfName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      city: 'Hyderabad, Telangana',
      avatarInitials: newProfName.slice(0, 2).toUpperCase(),
      tier: 'Standard Mobility Tier 1',
      rating: 5.0,
      walletBalance: 500,
      primaryVehicleId: vehicles[0].id,
      drivePreference: newProfType,
      dailyCommuteKm: 40,
      bioNotes: 'Newly registered driver on Routiq mobility platform.',
    };
    setProfiles((prev) => [...prev, newProf]);
    setActiveProfileId(newProf.id);
    setIsNewProfileOpen(false);
    setNewProfName('');
    setNewProfPhone('');
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehName.trim() || !newVehReg.trim()) return;

    const brandGuess = newVehName.split(' ')[0] || 'Custom';
    const modelGuess = newVehName.split(' ').slice(1).join(' ') || newVehName;

    const created: Vehicle = {
      id: `veh-${Date.now()}`,
      name: newVehName.trim(),
      brand: brandGuess,
      model: modelGuess,
      type: newVehType,
      registrationNumber: newVehReg.toUpperCase().trim(),
      ...(newVehType === 'EV'
        ? {
            batteryCapacityKWh: parseFloat(newVehCapacity) || 45,
            usableBatteryKWh: (parseFloat(newVehCapacity) || 45) * 0.92,
            realWorldRangeKm: Math.round((parseFloat(newVehCapacity) || 45) * 6.8),
            supportedConnectors: [newVehConnector],
            connectorType: newVehConnector,
            maxDCPowerKW: 120,
            currentBatteryPct: 80,
          }
        : {
            cylinderCapacityKg: parseFloat(newVehCapacity) || 10,
            cngTankCapacityKg: parseFloat(newVehCapacity) || 10,
            mileageKmPerKg: 31,
            cngCategory: 'Car',
            currentFuelKg: (parseFloat(newVehCapacity) || 10) * 0.75,
          }),
    };

    if (onAddVehicle) {
      onAddVehicle(created);
    }
    onSelectVehicle(created);
    setIsAddVehicleOpen(false);
    setNewVehName('');
    setNewVehReg('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Profile Switcher & Identity Header */}
      <div className="bg-[#07130F] border border-[#25C269]/25 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#031815] border-2 border-[#25C269] flex items-center justify-center text-[#25C269] text-2xl font-black shadow-inner">
              {currentProfile.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                {isInlineNameEditing ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      autoFocus
                      value={inlineNameVal}
                      onChange={(e) => setInlineNameVal(e.target.value)}
                      className="px-2 py-0.5 bg-[#031815] border border-[#25C269] rounded-lg text-white font-black text-lg focus:outline-none"
                    />
                    <button
                      onClick={handleSaveInlineName}
                      className="p-1 bg-[#25C269] text-[#07130F] rounded-lg hover:bg-[#25C269]/90"
                      title="Save name"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsInlineNameEditing(false)}
                      className="p-1 text-[#F6F1E8]/60 hover:text-white"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl sm:text-2xl font-black text-white">{currentProfile.name}</h2>
                    <button
                      onClick={() => {
                        setInlineNameVal(currentProfile.name);
                        setIsInlineNameEditing(true);
                      }}
                      className="p-1 text-[#F6F1E8]/50 hover:text-[#25C269] transition-colors"
                      title="Quick edit profile name"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-[#25C269]/20 text-[#25C269] text-[10px] font-mono font-bold border border-[#25C269]/30">
                  {currentProfile.tier}
                </span>
              </div>

              {/* Profile Details List */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#F6F1E8]/70 mt-1.5">
                <span className="flex items-center gap-1 text-[#25C269]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{currentProfile.city}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 text-[#F3C45B]">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{currentProfile.rating} Driver Rating</span>
                </span>
                <span>·</span>
                <span className="font-mono text-[#F6F1E8]/60">{currentProfile.phone}</span>
                <span>·</span>
                <span className="text-[#168BDB] font-mono text-[11px]">{currentProfile.email}</span>
                <span>·</span>
                <span className="text-[#F6F1E8]/60 font-mono text-[11px]">{currentProfile.dailyCommuteKm} km/day</span>
              </div>

              {/* Bio notes */}
              {currentProfile.bioNotes && (
                <p className="text-[11px] text-[#F6F1E8]/50 mt-1 italic">
                  "{currentProfile.bioNotes}"
                </p>
              )}
            </div>
          </div>

          {/* Action Row: Edit Profile Details, Wallet, Logout */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <button
              onClick={handleOpenEditProfile}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#031815] hover:bg-[#062B25] border border-[#25C269]/40 hover:border-[#25C269] rounded-xl text-xs font-bold text-[#25C269] transition-all shadow-sm"
              title="Edit full profile details"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile Details</span>
            </button>

            <button
              onClick={onOpenWallet}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#031815] hover:bg-[#062B25] border border-[#25C269]/40 rounded-xl text-xs font-bold text-[#F6F1E8] transition-colors shadow"
            >
              <Wallet className="w-4 h-4 text-[#25C269]" />
              <span>₹{currentProfile.walletBalance}</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#031815] hover:bg-red-950/60 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold transition-all"
                title="Log out of Routiq"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            )}
          </div>
        </div>

        {/* Multi-Profile Switcher Bar */}
        <div className="p-3.5 rounded-2xl bg-[#031815] border border-[#062B25] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-white flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-[#F6F1E8]/70">
              <Users className="w-3.5 h-3.5 text-[#25C269]" />
              <span>Switch Profile</span>
            </span>
            <button
              onClick={() => setIsNewProfileOpen(true)}
              className="text-[#25C269] hover:underline font-bold text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {profiles.map((prof) => {
              const isSelected = prof.id === activeProfileId;
              return (
                <button
                  key={prof.id}
                  onClick={() => handleSwitchProfile(prof)}
                  className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#07130F] border-2 border-[#25C269] shadow'
                      : 'bg-[#07130F]/40 border-[#062B25] hover:border-[#25C269]/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#031815] border border-[#25C269]/40 flex items-center justify-center font-bold text-[11px] text-[#25C269] shrink-0">
                      {prof.avatarInitials}
                    </span>
                    <div className="truncate">
                      <span className="font-bold text-xs text-white block truncate">
                        {prof.name}
                      </span>
                      <span className="text-[10px] text-[#F6F1E8]/50 block font-mono">
                        {prof.drivePreference} Preference
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#25C269] shrink-0 shadow-[0_0_8px_#25C269]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs within Profile */}
        <div className="flex items-center gap-1 border-t border-[#062B25] pt-3 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'OVERVIEW', label: 'Overview & Activity' },
            { id: 'BATTERY_HEALTH', label: '⚡ Battery Health & Efficiency' },
            { id: 'GARAGE', label: '🚗 Vehicle Garage' },
            { id: 'PREFERENCES', label: '⚙️ Settings & Privacy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#25C269] text-[#07130F] font-bold shadow'
                  : 'text-[#F6F1E8]/70 hover:text-white hover:bg-[#031815]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. TAB: BATTERY HEALTH & EFFICIENCY (Prominently Visualized with Recharts) */}
      {activeTab === 'BATTERY_HEALTH' && (
        <BatteryHealthSection vehicle={activeVehicle} />
      )}

      {/* 3. TAB: VEHICLE GARAGE */}
      {(activeTab === 'GARAGE' || activeTab === 'OVERVIEW') && (
        <div className="bg-[#07130F] border border-[#25C269]/20 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#062B25] pb-3">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-[#25C269]" />
              <div>
                <h3 className="font-extrabold text-white text-base">Vehicle Garage</h3>
                <p className="text-xs text-[#F6F1E8]/60">
                  Switch active vehicle or add new EV / CNG models
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddVehicleOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-bold text-xs rounded-xl shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vehicles.map((v) => {
              const isSelected = v.id === activeVehicle.id;
              return (
                <div
                  key={v.id}
                  onClick={() => onSelectVehicle(v)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#031815] border-2 border-[#25C269] shadow-xl ring-1 ring-[#25C269]/30'
                      : 'bg-[#031815]/60 border-[#062B25] hover:border-[#25C269]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {v.type === 'EV' ? (
                        <Zap className="w-4 h-4 text-[#168BDB] fill-current" />
                      ) : (
                        <Fuel className="w-4 h-4 text-[#25C269]" />
                      )}
                      <span className="font-bold text-white text-xs">{v.name}</span>
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-[#25C269]/20 text-[#25C269] text-[9px] font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 space-y-1.5 text-[11px] text-[#F6F1E8]/70 border-t border-[#062B25] pt-2">
                    <div className="flex justify-between">
                      <span>Registration:</span>
                      <span className="font-mono text-white font-bold">{v.registrationNumber}</span>
                    </div>
                    {v.type === 'EV' ? (
                      <>
                        <div className="flex justify-between">
                          <span>Connector:</span>
                          <span className="font-mono text-[#168BDB] font-bold">
                            {v.supportedConnectors?.join(', ') || v.connectorType || 'CCS2'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Battery Pack:</span>
                          <span className="font-mono text-white">{v.batteryCapacityKWh || 45} kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current SoC:</span>
                          <span className="font-mono text-[#25C269] font-bold">{v.currentBatteryPct || 68}%</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>Tank Capacity:</span>
                          <span className="font-mono text-white">{v.cylinderCapacityKg || v.cngTankCapacityKg || 9.5} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Fuel:</span>
                          <span className="font-mono text-[#25C269] font-bold">{v.currentFuelKg?.toFixed(1) || 7.2} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Compliance:</span>
                          <span className="font-mono text-[#25C269]">PESO Hydro-Tested</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAB: PREFERENCES & SETTINGS */}
      {activeTab === 'PREFERENCES' && (
        <div className="bg-[#07130F] border border-[#25C269]/20 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#062B25] pb-3">
            <Settings className="w-5 h-5 text-[#25C269]" />
            <h3 className="font-extrabold text-white text-base">Driver Preferences &amp; Privacy</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#031815] border border-[#062B25] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Smart Grid &amp; Peak Shaving</span>
                <input type="checkbox" defaultChecked className="accent-[#25C269] w-4 h-4 cursor-pointer" />
              </div>
              <p className="text-[#F6F1E8]/60 text-[11px]">
                Allows Routiq to recommend charging times when the local Telangana grid has excess renewable solar supply.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#031815] border border-[#062B25] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Public Transit Synergy Alerts</span>
                <input type="checkbox" defaultChecked className="accent-[#25C269] w-4 h-4 cursor-pointer" />
              </div>
              <p className="text-[#F6F1E8]/60 text-[11px]">
                Suggests Hyderabad Metro Park &amp; Charge hubs when Hitec City ORR corridors exceed 45-minute congestion.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#031815] border border-[#062B25] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Dynamic Queue Rerouting</span>
                <input type="checkbox" defaultChecked className="accent-[#25C269] w-4 h-4 cursor-pointer" />
              </div>
              <p className="text-[#F6F1E8]/60 text-[11px]">
                Automatically prompts alternative CNG stations if queue length surges by &gt; 5 vehicles while en route.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#031815] border border-[#062B25] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">DPDP Act 2023 Privacy Vault</span>
                <span className="text-[#25C269] font-mono font-bold">Enabled</span>
              </div>
              <p className="text-[#F6F1E8]/60 text-[11px]">
                Location telemetry is encrypted on device. GPS coordinates are purged immediately post-session.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. About Routiq & Scalable Architecture */}
      <div className="bg-[#07130F] border border-[#25C269]/20 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#062B25] pb-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/routiq_logo.png"
              alt="Routiq Logo"
              className="w-7 h-7 object-contain rounded"
            />
            <div>
              <h3 className="font-extrabold text-white text-base">About Routiq Ecosystem</h3>
              <p className="text-[11px] text-[#25C269] font-medium">Smarter Routes. Greener Journeys.</p>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#25C269]/15 text-[#25C269] font-mono font-bold border border-[#25C269]/30">
            v2.4 Production
          </span>
        </div>

        <div className="p-4 bg-[#031815] rounded-2xl border border-[#25C269]/30 space-y-3 text-xs">
          <p className="text-white font-medium italic">
            "One unified mobility layer connecting EV charging, CNG queues and intelligent corridor planning across Indian cities."
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-[#07130F] border border-[#062B25]">
              <span className="font-bold text-[#168BDB] block">⚡ EV</span>
              <span className="text-[10px] text-[#F6F1E8]/70">Charge smarter.</span>
            </div>
            <div className="p-2 rounded-xl bg-[#07130F] border border-[#062B25]">
              <span className="font-bold text-[#25C269] block">⛽ CNG</span>
              <span className="text-[10px] text-[#F6F1E8]/70">Wait less.</span>
            </div>
            <div className="p-2 rounded-xl bg-[#07130F] border border-[#062B25]">
              <span className="font-bold text-white block">↗️ TRIPP</span>
              <span className="text-[10px] text-[#F6F1E8]/70">Adapt to the road.</span>
            </div>
          </div>
          {onRestartOnboarding && (
            <div className="pt-2 border-t border-[#062B25] flex justify-end">
              <button
                onClick={onRestartOnboarding}
                className="text-[11px] font-bold text-[#25C269] hover:underline"
              >
                Replay First-Launch Experience →
              </button>
            </div>
          )}
        </div>

        {/* Scalable Future Initiatives Grid */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#25C269]" />
            <span>Future Initiatives &amp; Architecture Roadmap</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {futureInitiatives.map((init) => (
              <div
                key={init.id}
                onClick={() => setSelectedInitiative(init)}
                className="p-3.5 rounded-xl bg-[#031815] border border-[#062B25] hover:border-[#25C269]/40 cursor-pointer transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{init.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#25C269]" />
                </div>
                <p className="text-[11px] text-[#F6F1E8]/60 line-clamp-2 leading-normal">
                  {init.summary}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-[#25C269] pt-1">
                  <span className="font-mono">{init.status.replace('_', ' ')}</span>
                  <span>·</span>
                  <span className="truncate">{init.scalabilitySpec}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal 1: Edit Profile Name & Details */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#07130F] border border-[#25C269]/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs my-8">
            <div className="flex items-center justify-between border-b border-[#062B25] pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#25C269]" />
                <h3 className="font-extrabold text-white text-base">Edit Profile Name &amp; Details</h3>
              </div>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-[#F6F1E8]/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">Profile / Driver Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Aakash Varier"
                    className="w-full px-3 py-2 bg-[#031815] border border-[#062B25] focus:border-[#25C269] rounded-xl text-white placeholder-[#F6F1E8]/40 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">Mobile Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-[#031815] border border-[#062B25] focus:border-[#25C269] rounded-xl text-white font-mono placeholder-[#F6F1E8]/40 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="driver@example.com"
                    className="w-full px-3 py-2 bg-[#031815] border border-[#062B25] focus:border-[#25C269] rounded-xl text-white font-mono placeholder-[#F6F1E8]/40 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">City / Base Location</label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="e.g. Hyderabad, Telangana"
                    className="w-full px-3 py-2 bg-[#031815] border border-[#062B25] focus:border-[#25C269] rounded-xl text-white placeholder-[#F6F1E8]/40 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">Driver Tier / Role</label>
                  <select
                    value={editTier}
                    onChange={(e) => setEditTier(e.target.value)}
                    className="w-full px-3 py-2 bg-[#031815] border border-[#062B25] focus:border-[#25C269] rounded-xl text-white focus:outline-none"
                  >
                    <option value="Eco Champion Tier 4">Eco Champion Tier 4</option>
                    <option value="Family Commuter Tier 2">Family Commuter Tier 2</option>
                    <option value="Commercial Fleet Operator">Commercial Fleet Operator</option>
                    <option value="Daily Urban Commuter">Daily Urban Commuter</option>
                    <option value="Highway Corridor Traveler">Highway Corridor Traveler</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">Daily Commute (km/day)</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={editDailyCommute}
                    onChange={(e) => setEditDailyCommute(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#031815] border border-[#062B25] focus:border-[#25C269] rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Mobility Focus</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditDrivePreference('EV')}
                    className={`py-2 rounded-xl border text-center font-bold ${
                      editDrivePreference === 'EV'
                        ? 'border-[#168BDB] bg-[#168BDB]/20 text-[#168BDB]'
                        : 'border-[#062B25] bg-[#031815] text-[#F6F1E8]/60'
                    }`}
                  >
                    ⚡ EV Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditDrivePreference('CNG')}
                    className={`py-2 rounded-xl border text-center font-bold ${
                      editDrivePreference === 'CNG'
                        ? 'border-[#25C269] bg-[#25C269]/20 text-[#25C269]'
                        : 'border-[#062B25] bg-[#031815] text-[#F6F1E8]/60'
                    }`}
                  >
                    ⛽ CNG Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditDrivePreference('BOTH')}
                    className={`py-2 rounded-xl border text-center font-bold ${
                      editDrivePreference === 'BOTH'
                        ? 'border-[#F3C45B] bg-[#F3C45B]/20 text-[#F3C45B]'
                        : 'border-[#062B25] bg-[#031815] text-[#F6F1E8]/60'
                    }`}
                  >
                    🚗 Both
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Driver Notes / Bio</label>
                <textarea
                  rows={2}
                  value={editBioNotes}
                  onChange={(e) => setEditBioNotes(e.target.value)}
                  placeholder="Add notes about your driving style or vehicle preferences..."
                  className="w-full px-3 py-2 bg-[#031815] border border-[#062B25] focus:border-[#25C269] rounded-xl text-white placeholder-[#F6F1E8]/40 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#062B25]">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 py-2.5 bg-[#031815] text-[#F6F1E8]/70 hover:text-white rounded-xl border border-[#062B25]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-bold rounded-xl shadow"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Vehicle */}
      {isAddVehicleOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#07130F] border border-[#25C269]/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-[#062B25] pb-3">
              <h3 className="font-extrabold text-white text-base">Add New Vehicle to Garage</h3>
              <button onClick={() => setIsAddVehicleOpen(false)} className="text-[#F6F1E8]/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Vehicle Name &amp; Model</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MG ZS EV Exclusive or Tata Tiago EV"
                  value={newVehName}
                  onChange={(e) => setNewVehName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#031815] border border-[#062B25] focus:border-[#25C269] rounded-xl text-white placeholder-[#F6F1E8]/40 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Mobility Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewVehType('EV')}
                    className={`py-2 rounded-xl border text-center font-bold ${
                      newVehType === 'EV'
                        ? 'border-[#168BDB] bg-[#168BDB]/20 text-[#168BDB]'
                        : 'border-[#062B25] bg-[#031815] text-[#F6F1E8]/60'
                    }`}
                  >
                    ⚡ EV (Electric)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewVehType('CNG')}
                    className={`py-2 rounded-xl border text-center font-bold ${
                      newVehType === 'CNG'
                        ? 'border-[#25C269] bg-[#25C269]/20 text-[#25C269]'
                        : 'border-[#062B25] bg-[#031815] text-[#F6F1E8]/60'
                    }`}
                  >
                    ⛽ CNG
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Registration Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TS 09 EA 9821"
                  value={newVehReg}
                  onChange={(e) => setNewVehReg(e.target.value)}
                  className="w-full px-3 py-2 bg-[#031815] border border-[#062B25] focus:border-[#25C269] rounded-xl text-white font-mono placeholder-[#F6F1E8]/40 focus:outline-none"
                />
              </div>

              {newVehType === 'EV' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white">Battery Pack Capacity (kWh)</label>
                    <input
                      type="number"
                      required
                      value={newVehCapacity}
                      onChange={(e) => setNewVehCapacity(e.target.value)}
                      className="w-full px-3 py-2 bg-[#031815] border border-[#062B25] focus:border-[#25C269] rounded-xl text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white">Primary Connector Type</label>
                    <select
                      value={newVehConnector}
                      onChange={(e) => setNewVehConnector(e.target.value as EVConnectorType)}
                      className="w-full px-3 py-2 bg-[#031815] border border-[#062B25] focus:border-[#25C269] rounded-xl text-white font-mono focus:outline-none"
                    >
                      <option value="CCS2">CCS2 (Fast DC Standard in India)</option>
                      <option value="Type 2">Type 2 (AC Slow/Mennekes)</option>
                      <option value="GB/T">GB/T</option>
                      <option value="CHAdeMO">CHAdeMO</option>
                    </select>
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">CNG Cylinder Water Capacity (kg)</label>
                  <input
                    type="number"
                    required
                    value={newVehCapacity}
                    onChange={(e) => setNewVehCapacity(e.target.value)}
                    className="w-full px-3 py-2 bg-[#031815] border border-[#062B25] focus:border-[#25C269] rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleOpen(false)}
                  className="flex-1 py-2.5 bg-[#031815] text-[#F6F1E8]/70 hover:text-white rounded-xl border border-[#062B25]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-bold rounded-xl shadow"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Create Profile */}
      {isNewProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#07130F] border border-[#25C269]/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-[#062B25] pb-3">
              <h3 className="font-extrabold text-white text-base">Create New Routiq Profile</h3>
              <button onClick={() => setIsNewProfileOpen(false)} className="text-[#F6F1E8]/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Profile Name / Account Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma or Airport Commute Fleet"
                  value={newProfName}
                  onChange={(e) => setNewProfName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#031815] border border-[#062B25] focus:border-[#25C269] rounded-xl text-white placeholder-[#F6F1E8]/40 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={newProfPhone}
                  onChange={(e) => setNewProfPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#031815] border border-[#062B25] focus:border-[#25C269] rounded-xl text-white font-mono placeholder-[#F6F1E8]/40 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Primary Driving Focus</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewProfType('EV')}
                    className={`py-2 rounded-xl border text-center font-bold ${
                      newProfType === 'EV'
                        ? 'border-[#168BDB] bg-[#168BDB]/20 text-[#168BDB]'
                        : 'border-[#062B25] bg-[#031815] text-[#F6F1E8]/60'
                    }`}
                  >
                    ⚡ EV Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewProfType('CNG')}
                    className={`py-2 rounded-xl border text-center font-bold ${
                      newProfType === 'CNG'
                        ? 'border-[#25C269] bg-[#25C269]/20 text-[#25C269]'
                        : 'border-[#062B25] bg-[#031815] text-[#F6F1E8]/60'
                    }`}
                  >
                    ⛽ CNG Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewProfType('BOTH')}
                    className={`py-2 rounded-xl border text-center font-bold ${
                      newProfType === 'BOTH'
                        ? 'border-[#F3C45B] bg-[#F3C45B]/20 text-[#F3C45B]'
                        : 'border-[#062B25] bg-[#031815] text-[#F6F1E8]/60'
                    }`}
                  >
                    🚗 Both
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProfileOpen(false)}
                  className="flex-1 py-2.5 bg-[#031815] text-[#F6F1E8]/70 hover:text-white rounded-xl border border-[#062B25]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-bold rounded-xl shadow"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Selected Future Initiative */}
      {selectedInitiative && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#07130F] border border-[#25C269]/50 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-extrabold text-white text-base">
                  {selectedInitiative.title}
                </h3>
                <span className="text-[11px] text-[#25C269] font-mono">
                  Readiness: {selectedInitiative.status.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={() => setSelectedInitiative(null)}
                className="p-1 text-[#F6F1E8]/50 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#F6F1E8]/80 leading-relaxed">
              {selectedInitiative.summary}
            </p>

            <div className="p-3 bg-[#031815] rounded-xl border border-[#062B25] space-y-2">
              <span className="font-bold text-white uppercase text-[10px] tracking-wider block">
                Scalability Architecture &amp; Target Metric
              </span>
              <p className="text-xs font-mono text-[#25C269]">
                {selectedInitiative.scalabilitySpec}
              </p>
              <p className="text-[11px] text-[#F6F1E8]/70 pt-1 border-t border-[#062B25]">
                {selectedInitiative.indianContext}
              </p>
            </div>

            <button
              onClick={() => setSelectedInitiative(null)}
              className="w-full py-2.5 bg-[#25C269] text-[#07130F] font-bold rounded-xl text-xs shadow"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
