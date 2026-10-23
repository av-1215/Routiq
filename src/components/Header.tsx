import React, { useState } from 'react';
import { Wallet as WalletIcon, QrCode, MapPin, ChevronDown, Building2 } from 'lucide-react';
import { Wallet } from '../types';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  wallet: Wallet;
  onOpenWallet: () => void;
  onOpenQR: () => void;
  onOpenOperator?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  wallet,
  onOpenWallet,
  onOpenQR,
  onOpenOperator,
}) => {
  const [selectedCity, setSelectedCity] = useState('Hyderabad, Telangana');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const cities = [
    'Hyderabad, Telangana',
    'Bengaluru, Karnataka',
    'Delhi NCR (Cyber City)',
    'Mumbai (BKC & Navi Mumbai)',
    'Pune, Maharashtra',
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#07130F]/95 backdrop-blur-md border-b border-[#25C269]/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5">
        {/* Left: Brand Identity + City Selector */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onSelectTab('overview')}
            className="flex items-center gap-2.5 text-left group transition-all"
          >
            <img
              src="/routiq_logo.png"
              alt="Routiq Logo"
              className="w-8 h-8 rounded-lg object-contain bg-[#031815] p-0.5 border border-[#25C269]/40 shadow-sm shrink-0 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="leading-tight font-black text-white text-base tracking-tight">
                Routiq
              </span>
              <span className="text-[9px] font-semibold text-[#25C269] leading-none">
                Smarter Routes. Greener Journeys.
              </span>
            </div>
          </button>

          {/* City Selector Pill */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#031815] hover:bg-[#062B25] border border-[#25C269]/30 text-[11px] text-[#F6F1E8]/80 hover:text-white transition-colors"
            >
              <MapPin className="w-3 h-3 text-[#25C269]" />
              <span>{selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-[#F6F1E8]/50" />
            </button>

            {isCityDropdownOpen && (
              <div className="absolute left-0 mt-1 w-52 bg-[#07130F] border border-[#25C269]/40 rounded-xl shadow-2xl py-1 z-50 text-xs">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-[#25C269]/15 transition-colors ${
                      selectedCity === city ? 'text-[#25C269] font-bold' : 'text-[#F6F1E8]/80'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Standard 6 Primary Tabs (Section 7 in specification) */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Home' },
            { id: 'explore', label: 'Explore' },
            { id: 'tripp', label: 'TRIPP' },
            { id: 'community', label: 'Community' },
            { id: 'bookings', label: 'Bookings' },
            { id: 'profile', label: 'Profile' },
          ].map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#25C269] text-[#07130F] font-bold shadow-sm'
                    : 'text-[#F6F1E8]/70 hover:text-white hover:bg-[#031815]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Wallet + Quick QR Scanner + Operator */}
        <div className="flex items-center gap-2">
          {onOpenOperator && (
            <button
              onClick={onOpenOperator}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#031815] hover:bg-[#062B25] text-[#F6F1E8]/70 hover:text-white border border-[#062B25] text-[11px] font-semibold transition-colors"
              title="Station Operator Control"
            >
              <Building2 className="w-3.5 h-3.5 text-[#25C269]" />
              <span>Operator</span>
            </button>
          )}

          <button
            onClick={onOpenWallet}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#031815] hover:bg-[#062B25] border border-[#25C269]/40 rounded-xl text-xs font-bold text-[#F6F1E8] transition-colors"
            title="Open Routiq Mobility Wallet"
          >
            <WalletIcon className="w-3.5 h-3.5 text-[#25C269]" />
            <span className="font-mono">₹{wallet.availableBalance}</span>
          </button>

          <button
            onClick={onOpenQR}
            className="p-1.5 rounded-xl bg-[#25C269]/20 hover:bg-[#25C269]/30 text-[#25C269] border border-[#25C269]/40 transition-colors"
            title="Scan QR at EV Bay / CNG Pump"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
