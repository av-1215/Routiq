import React from 'react';
import { LayoutGrid, Compass, Calendar, Users, User, Search } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: 'overview', label: 'Home', icon: LayoutGrid },
    { id: 'explore', label: 'Explore', icon: Search },
    { id: 'tripp', label: 'TRIPP', icon: Compass },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#07130F]/95 backdrop-blur-md border-t border-[#25C269]/20 py-1.5 px-2">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors ${
                isActive ? 'text-[#25C269] font-bold' : 'text-[#F6F1E8]/60 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[9px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
