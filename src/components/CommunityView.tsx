import React, { useState } from 'react';
import { Station } from '../types';
import {
  Users,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  MapPin,
  Clock,
  Send,
  Plus,
  ShieldCheck,
  Megaphone,
  Gift,
  Lightbulb,
  X,
  Filter
} from 'lucide-react';

interface CommunityReport {
  id: string;
  stationName: string;
  category: 'QUEUE_MISMATCH' | 'CHARGER_FAULT' | 'CNG_PRESSURE' | 'AMENITY' | 'OPERATOR_UPDATE';
  content: string;
  reportedMinutesAgo: number;
  confirmedCount: number;
  isVerified: boolean;
  author: string;
  usefulVotes: number;
  notUsefulVotes: number;
  userVote?: 'UP' | 'DOWN';
}

interface CommunitySuggestion {
  id: string;
  title: string;
  category: 'CHARGER_ADDITION' | 'CANTEEN_AMENITY' | 'FAST_LANE' | 'ROOFTOP_SOLAR';
  description: string;
  votes: number;
  userVoted: boolean;
  status: 'UNDER_REVIEW' | 'ACCEPTED' | 'SCHEDULED';
  stationTarget: string;
}

interface CommunityViewProps {
  stations: Station[];
  onSelectStation?: (st: Station) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ stations, onSelectStation }) => {
  const [activeTab, setActiveTab] = useState<'UPDATES' | 'NEARBY' | 'DISCUSSIONS' | 'SUGGESTIONS' | 'BENEFITS'>('NEARBY');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNewDiscussionOpen, setIsNewDiscussionOpen] = useState(false);

  // New report form state
  const [selectedStationId, setSelectedStationId] = useState(stations[0]?.id || '');
  const [reportCategory, setReportCategory] = useState<'QUEUE_MISMATCH' | 'CHARGER_FAULT' | 'CNG_PRESSURE' | 'AMENITY'>('QUEUE_MISMATCH');
  const [reportText, setReportText] = useState('');

  // Sample community reports with realistic verification metadata (Section 31-33)
  const [reports, setReports] = useState<CommunityReport[]>([
    {
      id: 'rep-1',
      stationName: 'Bhagyanagar Gas Ltd — Madhapur Manifold',
      category: 'QUEUE_MISMATCH',
      content: 'Physical line stretches near Hitec City bridge. App showed 15m, actual wait is approx 32 minutes right now.',
      reportedMinutesAgo: 4,
      confirmedCount: 6,
      isVerified: true,
      author: 'Kiran V. (WagonR CNG)',
      usefulVotes: 14,
      notUsefulVotes: 1,
    },
    {
      id: 'rep-2',
      stationName: 'Jio-bp pulse & Clean Fuels — Gachibowli ORR',
      category: 'CHARGER_FAULT',
      content: 'Bay 04 screen shows communication timeout. Bay 01 and Bay 02 150kW ultra-fast working flawlessly.',
      reportedMinutesAgo: 12,
      confirmedCount: 3,
      isVerified: true,
      author: 'Pooja S. (Nexon EV)',
      usefulVotes: 18,
      notUsefulVotes: 0,
    },
    {
      id: 'rep-3',
      stationName: 'Fortum Charge & Drive — Financial District',
      category: 'OPERATOR_UPDATE',
      content: 'Operator announced 2 new 60kW CCS2 dispensers commissioned today. Low waiting time.',
      reportedMinutesAgo: 28,
      confirmedCount: 9,
      isVerified: true,
      author: 'Station Manager (Fortum Team)',
      usefulVotes: 24,
      notUsefulVotes: 0,
    },
    {
      id: 'rep-4',
      stationName: 'HPCL Auto Gas & CNG Hub — Miyapur X Roads',
      category: 'CNG_PRESSURE',
      content: 'Compressor line pressure steady at 218 bar. Fast filling completed in under 4 minutes!',
      reportedMinutesAgo: 45,
      confirmedCount: 5,
      isVerified: true,
      author: 'Ramesh R. (Bajaj Auto)',
      usefulVotes: 11,
      notUsefulVotes: 1,
    },
  ]);

  // Suggestions state (Section 35: Users -> Feedback -> Routiq -> Operators -> Better facilities)
  const [suggestions, setSuggestions] = useState<CommunitySuggestion[]>([
    {
      id: 'sug-1',
      title: 'Dedicated Auto-Rickshaw Express Manifold at Madhapur',
      category: 'FAST_LANE',
      description: 'Separate 3-wheelers from private cars during morning rush hour (8–10 AM) to prevent bottleneck spillover on the main road.',
      votes: 142,
      userVoted: false,
      status: 'SCHEDULED',
      stationTarget: 'Bhagyanagar Gas Madhapur',
    },
    {
      id: 'sug-2',
      title: 'Shaded Canopy & Water Dispenser at Gachibowli Hub',
      category: 'CANTEEN_AMENITY',
      description: 'High afternoon sun exposure while waiting for 80% fast-charge top-up. A solar-powered shaded canopy would help drivers relax.',
      votes: 89,
      userVoted: false,
      status: 'ACCEPTED',
      stationTarget: 'Jio-bp Gachibowli ORR',
    },
    {
      id: 'sug-3',
      title: 'Add Ather Dot & Bharat AC001 charging points for delivery fleets',
      category: 'CHARGER_ADDITION',
      description: 'Many Zomato and Swiggy delivery riders on 2-wheelers stop nearby; adding 3.3kW AC points would serve the hyper-local delivery grid.',
      votes: 67,
      userVoted: false,
      status: 'UNDER_REVIEW',
      stationTarget: 'Financial District Spine Hub',
    },
  ]);

  // Discussions state
  const [discussions, setDiscussions] = useState([
    {
      id: 'disc-1',
      author: 'Vikram Mehta',
      badge: 'Daily ORR Commuter',
      title: 'Best time for zero-wait CNG on Outer Ring Road?',
      replies: 8,
      timestamp: '2 hours ago',
      content: 'I drive between Miyapur and Financial District daily. Jio-bp Gachibowli has near-zero queues between 1:30 PM and 3:30 PM due to shift changes.',
    },
    {
      id: 'disc-2',
      author: 'Ananya Roy',
      badge: 'Nexon EV Owner',
      title: 'Tariff comparison: Off-peak solar vs evening grid rates',
      replies: 12,
      timestamp: '5 hours ago',
      content: 'Inorbit Cyber Solar Hub charges ₹14.50/kWh between 11 AM - 3 PM strictly from rooftop solar. Saved almost ₹140 on a full 45kWh top-up today!',
    },
  ]);

  const handleVote = (id: string, type: 'UP' | 'DOWN') => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const currentVote = r.userVote;
          let useful = r.usefulVotes;
          let notUseful = r.notUsefulVotes;

          if (currentVote === type) {
            // Undo
            if (type === 'UP') useful--;
            else notUseful--;
            return { ...r, usefulVotes: useful, notUsefulVotes: notUseful, userVote: undefined };
          } else {
            if (currentVote === 'UP') useful--;
            if (currentVote === 'DOWN') notUseful--;
            if (type === 'UP') useful++;
            else notUseful++;
            return { ...r, usefulVotes: useful, notUsefulVotes: notUseful, userVote: type };
          }
        }
        return r;
      })
    );
  };

  const handleSuggestionVote = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            votes: s.userVoted ? s.votes - 1 : s.votes + 1,
            userVoted: !s.userVoted,
          };
        }
        return s;
      })
    );
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;

    const matchedStation = stations.find((s) => s.id === selectedStationId);
    const newRep: CommunityReport = {
      id: `rep-${Date.now()}`,
      stationName: matchedStation?.name || 'Selected Station',
      category: reportCategory,
      content: reportText.trim(),
      reportedMinutesAgo: 1,
      confirmedCount: 1,
      isVerified: false,
      author: 'You (Verified Driver)',
      usefulVotes: 1,
      notUsefulVotes: 0,
      userVote: 'UP',
    };

    setReports([newRep, ...reports]);
    setReportText('');
    setIsReportModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#07130F] border border-[#25C269]/25 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#25C269]" />
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Routiq Community Network
              </h2>
            </div>
            <p className="text-xs text-[#F6F1E8]/70 mt-1">
              Real-time driver reports, verified queue updates, operator announcements, and facility improvement proposals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Report Station Status</span>
            </button>
          </div>
        </div>

        {/* 5 Sub-Tabs Navigation (Section 32) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-4 border-t border-[#062B25] text-xs">
          {[
            { id: 'NEARBY', label: 'Nearby Reports', icon: AlertTriangle },
            { id: 'UPDATES', label: 'Operator Updates', icon: Megaphone },
            { id: 'DISCUSSIONS', label: 'Discussions', icon: MessageSquare },
            { id: 'SUGGESTIONS', label: 'Facility Upgrades', icon: Lightbulb },
            { id: 'BENEFITS', label: 'Driver Perks & Benefits', icon: Gift },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#25C269] text-[#07130F] shadow-sm'
                    : 'bg-[#031815] text-[#F6F1E8]/70 hover:text-white border border-[#062B25]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: NEARBY VERIFIED REPORTS */}
      {activeTab === 'NEARBY' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#F6F1E8]/70 px-1">
            <span>Live crowd-verified observations around Hyderabad</span>
            <span className="text-[11px] text-[#25C269] font-mono">
              Feedback Loop Active
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 sm:p-5 bg-[#07130F] rounded-2xl border border-[#25C269]/20 hover:border-[#25C269]/40 transition-colors shadow-md space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#062B25] pb-2.5">
                  <div>
                    <h3 className="font-bold text-white text-sm">{rep.stationName}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-[#F6F1E8]/60 mt-0.5">
                      <span>{rep.author}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#25C269]" />
                        <span>{rep.reportedMinutesAgo} min ago</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {rep.isVerified ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#25C269]/15 text-[#25C269] text-[10px] font-bold border border-[#25C269]/30 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{rep.confirmedCount} drivers confirmed</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        Pending verification
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#F6F1E8]/90 leading-relaxed">
                  {rep.content}
                </p>

                {/* Vote & Helpfulness Row */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-[#F6F1E8]/50">
                    Was this live report accurate?
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(rep.id, 'UP')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors ${
                        rep.userVote === 'UP'
                          ? 'bg-[#25C269]/20 border-[#25C269] text-[#25C269]'
                          : 'bg-[#031815] border-[#062B25] text-[#F6F1E8]/70 hover:text-white'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Useful ({rep.usefulVotes})</span>
                    </button>

                    <button
                      onClick={() => handleVote(rep.id, 'DOWN')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                        rep.userVote === 'DOWN'
                          ? 'bg-red-500/20 border-red-500 text-red-300'
                          : 'bg-[#031815] border-[#062B25] text-[#F6F1E8]/50 hover:text-white'
                      }`}
                    >
                      <ThumbsDown className="w-3 h-3" />
                      <span>Not useful ({rep.notUsefulVotes})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: OPERATOR OFFICIAL UPDATES */}
      {activeTab === 'UPDATES' && (
        <div className="space-y-3">
          <div className="p-4 bg-[#07130F] rounded-2xl border border-[#25C269]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-[#25C269]/20 text-[#25C269] text-[10px] font-bold font-mono">
                SCHEDULED MAINTENANCE
              </span>
              <span className="text-[11px] text-[#F6F1E8]/60">Tonight, 11:00 PM – 01:00 AM</span>
            </div>
            <h4 className="font-bold text-white text-sm">
              Jio-bp pulse Gachibowli — Substation Transformer Upgrade
            </h4>
            <p className="text-xs text-[#F6F1E8]/70 leading-relaxed">
              Dispensers 01 &amp; 02 will be operating at 60kW throttled rate during scheduled grid transformer maintenance. Bay 03 &amp; 04 unaffected.
            </p>
          </div>

          <div className="p-4 bg-[#07130F] rounded-2xl border border-[#168BDB]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-[#168BDB]/20 text-[#168BDB] text-[10px] font-bold font-mono">
                NEW CAPACITY ADDED
              </span>
              <span className="text-[11px] text-[#F6F1E8]/60">Yesterday</span>
            </div>
            <h4 className="font-bold text-white text-sm">
              Bhagyanagar Gas Madhapur — 4th High-Pressure Dispenser Commissioned
            </h4>
            <p className="text-xs text-[#F6F1E8]/70 leading-relaxed">
              PNGRB safety audits completed. New 220 bar commercial auto-manifold is now live, reducing peak waiting times by an estimated 8 minutes.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: DISCUSSIONS */}
      {activeTab === 'DISCUSSIONS' && (
        <div className="space-y-3">
          {discussions.map((disc) => (
            <div
              key={disc.id}
              className="p-5 bg-[#07130F] rounded-2xl border border-[#25C269]/20 space-y-3 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{disc.title}</h4>
                  <div className="text-[11px] text-[#F6F1E8]/60 mt-0.5">
                    Started by {disc.author} ({disc.badge}) · {disc.timestamp}
                  </div>
                </div>
                <span className="px-2 py-1 rounded-lg bg-[#031815] text-[#25C269] text-xs font-bold border border-[#062B25]">
                  {disc.replies} replies
                </span>
              </div>
              <p className="text-xs text-[#F6F1E8]/80 leading-relaxed">{disc.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SUGGESTIONS & FACILITY UPGRADES (Section 35) */}
      {activeTab === 'SUGGESTIONS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#F6F1E8]/70 px-1">
            <span>Vote on community proposals sent directly to station operators</span>
            <span className="text-[#25C269] font-mono">Direct Operator Loop</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {suggestions.map((sug) => (
              <div
                key={sug.id}
                className="p-5 bg-[#07130F] rounded-2xl border border-[#25C269]/20 hover:border-[#25C269]/40 transition-colors shadow-md space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{sug.title}</h4>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          sug.status === 'SCHEDULED'
                            ? 'bg-[#25C269]/20 text-[#25C269]'
                            : sug.status === 'ACCEPTED'
                            ? 'bg-[#168BDB]/20 text-[#168BDB]'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {sug.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#25C269] font-medium block mt-0.5">
                      Target Hub: {sug.stationTarget}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSuggestionVote(sug.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all ${
                      sug.userVoted
                        ? 'bg-[#25C269] text-[#07130F] border-[#25C269] shadow'
                        : 'bg-[#031815] text-white border-[#062B25] hover:border-[#25C269]/40'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Upvote ({sug.votes})</span>
                  </button>
                </div>

                <p className="text-xs text-[#F6F1E8]/80 leading-relaxed">
                  {sug.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DRIVER PERKS & BENEFITS */}
      {activeTab === 'BENEFITS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-[#07130F] rounded-2xl border border-[#25C269]/30 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-[#25C269]/20 text-[#25C269] flex items-center justify-center font-bold">
                ⚡
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#25C269]/15 text-[#25C269] font-bold">
                ACTIVE VOUCHER
              </span>
            </div>
            <h4 className="font-bold text-white text-sm">Off-Peak Solar Charging Discount</h4>
            <p className="text-xs text-[#F6F1E8]/70 leading-relaxed">
              Charge between 11:00 AM and 03:00 PM at participating solar microgrid hubs for 15% off base kWh tariffs.
            </p>
            <div className="text-[11px] font-mono text-[#25C269] pt-1">
              Code: ROUTIQ-SOLAR-GREEN
            </div>
          </div>

          <div className="p-5 bg-[#07130F] rounded-2xl border border-[#168BDB]/30 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-[#168BDB]/20 text-[#168BDB] flex items-center justify-center font-bold">
                ☕
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#168BDB]/15 text-[#168BDB] font-bold">
                FREE AMENITY
              </span>
            </div>
            <h4 className="font-bold text-white text-sm">Complimentary Café CCD Coffee</h4>
            <p className="text-xs text-[#F6F1E8]/70 leading-relaxed">
              Show your Routiq confirmed reservation pass at Gachibowli ORR Café CCD lounge to receive a complimentary hot beverage.
            </p>
            <div className="text-[11px] font-mono text-[#168BDB] pt-1">
              Valid for active EV Bay holders
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REPORT STATION STATUS (Section 31 & 33) */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#07130F] border border-[#25C269]/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-[#062B25] pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#25C269]" />
                <h3 className="font-extrabold text-white text-base">Report Station Observation</h3>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 text-[#F6F1E8]/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-[#F6F1E8]/60 block mb-1">
                  Select Station
                </label>
                <select
                  value={selectedStationId}
                  onChange={(e) => setSelectedStationId(e.target.value)}
                  className="w-full bg-[#031815] text-white p-2.5 rounded-xl border border-[#062B25] focus:border-[#25C269] focus:outline-none text-xs"
                >
                  {stations.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-[#F6F1E8]/60 block mb-1">
                  Issue Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'QUEUE_MISMATCH', label: 'Queue Mismatch' },
                    { id: 'CHARGER_FAULT', label: 'Charger Fault' },
                    { id: 'CNG_PRESSURE', label: 'Pressure Issue' },
                    { id: 'AMENITY', label: 'Amenity Offline' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setReportCategory(cat.id as any)}
                      className={`p-2 rounded-lg border text-left text-[11px] font-bold transition-colors ${
                        reportCategory === cat.id
                          ? 'bg-[#25C269]/20 border-[#25C269] text-[#25C269]'
                          : 'bg-[#031815] border-[#062B25] text-[#F6F1E8]/70 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-[#F6F1E8]/60 block mb-1">
                  Observation Details
                </label>
                <textarea
                  rows={3}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="e.g. Line is 8 cars longer than displayed; Dispenser 02 pressure low..."
                  className="w-full bg-[#031815] text-white p-3 rounded-xl border border-[#062B25] focus:border-[#25C269] focus:outline-none text-xs placeholder-[#F6F1E8]/40"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-[#062B25] text-[#F6F1E8]/70 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-black rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Live Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
