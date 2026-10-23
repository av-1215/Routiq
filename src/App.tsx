import React, { useState, useEffect } from 'react';
import {
  Amenity,
  CNGDispenser,
  CNGGreenWindow,
  EVChargerBay,
  EVReservation,
  FeedbackItem,
  FutureInitiative,
  Station,
  UserMobilityProfile,
  Vehicle,
  Wallet,
} from './types';
import {
  FUTURE_INITIATIVES,
  INITIAL_FEEDBACK,
  INITIAL_STATIONS,
  INITIAL_USER_PROFILE,
  INITIAL_VEHICLES,
  INITIAL_WALLET,
} from './data/mockDatabase';
import { Header } from './components/Header';
import { HeroLanding } from './components/HeroLanding';
import { ExploreView } from './components/ExploreView';
import { TrippPlanner } from './components/TrippPlanner';
import { CommunityView } from './components/CommunityView';
import { BookingsView } from './components/BookingsView';
import { ProfileView } from './components/ProfileView';
import { OnboardingFlow } from './components/OnboardingFlow';
import { ActiveJourneyOverlay } from './components/ActiveJourneyOverlay';
import { OperatorDashboardModal } from './components/OperatorDashboardModal';
import { DemoControlPanel } from './components/DemoControlPanel';
import { StationDetailModal } from './components/StationDetailModal';
import { EVReservationModal } from './components/EVReservationModal';
import { CNGGreenWindowModal } from './components/CNGGreenWindowModal';
import { WalletModal } from './components/WalletModal';
import { QRScannerModal } from './components/QRScannerModal';
import { SlotExchangeModal } from './components/SlotExchangeModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AuthScreen } from './components/AuthScreen';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  // First-launch onboarding state (Section 3 of specification)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('routiq_onboarded_v2') === 'true';
  });
  const [userDrivePreference, setUserDrivePreference] = useState<'EV' | 'CNG' | 'BOTH'>('BOTH');
  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(false);

  // Navigation: 'overview' (Home), 'explore', 'tripp', 'community', 'bookings', 'profile'
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [exploreInitialMode, setExploreInitialMode] = useState<'EV' | 'CNG'>('EV');
  const [trippTargetDestination, setTrippTargetDestination] = useState<string>(
    'Rajiv Gandhi International Airport (RGIA), Shamshabad'
  );

  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle>(INITIAL_VEHICLES[3]); // Nexon EV default
  const [stations, setStations] = useState<Station[]>(INITIAL_STATIONS);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [wallet, setWallet] = useState<Wallet>(INITIAL_WALLET);
  const [userProfile, setUserProfile] = useState<UserMobilityProfile>(INITIAL_USER_PROFILE);
  const [futureInitiatives, setFutureInitiatives] = useState<FutureInitiative[]>(FUTURE_INITIATIVES);

  // Sensor Telemetry Health State (Section 20 & 21)
  const [isSensorHealthy, setIsSensorHealthy] = useState<boolean>(true);

  // Active Journey Driving Mode (Section 51 & 52)
  const [isActiveJourneyOpen, setIsActiveJourneyOpen] = useState(false);

  // Operator Command Center Modal (Section 54)
  const [isOperatorOpen, setIsOperatorOpen] = useState(false);

  // User bookings state
  const [evReservations, setEvReservations] = useState<EVReservation[]>([
    {
      id: 'RQ-EV-982141',
      stationId: 'st-hyd-jiocng-gachibowli',
      stationName: 'Jio-bp pulse & Clean Fuels — Gachibowli ORR Junction',
      chargerId: 'ch-hyd-g1',
      bayNumber: 'Bay 01 (Ultra-Fast 150kW)',
      connectorType: 'CCS2',
      powerKW: 150,
      vehicleId: 'ev-nexon-empowered',
      vehicleName: 'Tata Nexon EV Empowered+',
      date: 'Today',
      startTime: '14:30',
      endTime: '15:15',
      durationMinutes: 45,
      arrivalWindow: '14:30 – 15:15',
      gracePeriodMinutes: 15,
      totalAmount: 380,
      status: 'CONFIRMED',
      qrCodeToken: 'QR-ROUTIQ-BAY01-982141',
      createdAt: '11:15 AM',
    },
  ]);

  const [cngWindows, setCngWindows] = useState<CNGGreenWindow[]>([
    {
      id: 'RQ-CNG-882190',
      stationId: 'st-hyd-jiocng-gachibowli',
      stationName: 'Jio-bp pulse & Clean Fuels — Gachibowli ORR Junction',
      vehicleId: 'cng-wagonr',
      vehicleName: 'Maruti Suzuki WagonR LXi CNG',
      category: 'Car',
      etaTime: '16:15',
      greenWindowStart: '16:10',
      greenWindowEnd: '16:25',
      queuePosition: 4,
      estimatedWaitMinutes: 7,
      status: 'ASSIGNED',
      ghostRiskScore: 8,
      trafficDelayMinutes: 0,
      qrToken: 'QR-ROUTIQ-GW-882190',
      createdAt: '10:45 AM',
    },
  ]);

  // Modals
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [isEVModalOpen, setIsEVModalOpen] = useState(false);
  const [isCNGModalOpen, setIsCNGModalOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isSlotExchangeOpen, setIsSlotExchangeOpen] = useState(false);
  const [activeExchangeWindow, setActiveExchangeWindow] = useState<CNGGreenWindow | null>(null);

  // Global alert
  const [activeAlert, setActiveAlert] = useState<{
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  // Subtle live sensor ticker
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSensorHealthy) return; // Do not update if sensor link is killed

      setStations((prev) =>
        prev.map((st) => {
          const newSeconds = Math.floor(Math.random() * 15) + 3;
          let newQueue = { ...st.cngQueue };
          if (st.type !== 'EV') {
            const deltaQueue = (Math.random() > 0.6 ? 1 : -1) * (Math.random() > 0.8 ? 1 : 0);
            const total = Math.max(1, newQueue.totalVehiclesAhead + deltaQueue);
            newQueue = {
              ...newQueue,
              totalVehiclesAhead: total,
              estimatedWaitMinutes: Math.max(3, Math.round(total * 2.1)),
            };
          }
          return {
            ...st,
            lastSensorUpdateSecondsAgo: newSeconds,
            cngQueue: newQueue,
          };
        })
      );
    }, 8000);
    return () => clearInterval(interval);
  }, [isSensorHealthy]);

  // Handlers for Onboarding
  const handleCompleteOnboarding = (prefs: {
    driveType: 'EV' | 'CNG' | 'BOTH';
    selectedVehicle: Vehicle;
    locationGranted: boolean;
    city: string;
  }) => {
    setUserDrivePreference(prefs.driveType);
    setActiveVehicle(prefs.selectedVehicle);
    setUserProfile((prev) => ({ ...prev, city: prefs.city }));
    setHasCompletedOnboarding(true);
    localStorage.setItem('routiq_onboarded_v2', 'true');
    setActiveAlert({
      title: 'Welcome to Routiq',
      description: `Personalized for your ${prefs.selectedVehicle.name}. Home displays clean summaries; Explore & TRIPP have full maps.`,
    });
  };

  const handleRestartOnboarding = () => {
    localStorage.removeItem('routiq_onboarded_v2');
    setHasCompletedOnboarding(false);
  };

  // Handlers for Bookings & Reservations
  const handleConfirmEVReservation = (res: EVReservation) => {
    setEvReservations((prev) => [res, ...prev]);
    setWallet((prev) => ({
      ...prev,
      availableBalance: Math.max(0, prev.availableBalance - 150),
      reservedBalance: prev.reservedBalance + 150,
      transactions: [
        {
          id: `tx-${Date.now()}`,
          type: 'RESERVATION_HOLD',
          amount: 150,
          description: `Routiq Bay Lock: ${res.bayNumber} at ${res.stationName}`,
          timestamp: 'Just now',
          status: 'COMPLETED',
          receiptId: `REC-RQ-${Math.floor(10000 + Math.random() * 90000)}`,
        },
        ...prev.transactions,
      ],
    }));
    setActiveAlert({
      title: 'EV Bay Locked (15-Min Hold Active)',
      description: `Hardware contactor reserved for ${res.bayNumber} at ${res.stationName}. Your pass is ready under Bookings.`,
      actionLabel: 'View Pass',
      onAction: () => setCurrentTab('bookings'),
    });
  };

  const handleAssignCNGWindow = (gw: CNGGreenWindow) => {
    setCngWindows((prev) => [gw, ...prev]);
    setActiveAlert({
      title: 'CNG Virtual Green Window Confirmed',
      description: `Queue position #${gw.queuePosition} reserved. Arrive during ${gw.greenWindowStart}–${gw.greenWindowEnd} for zero wait.`,
      actionLabel: 'View Token',
      onAction: () => setCurrentTab('bookings'),
    });
  };

  const handleQuickQRCharge = (charger: EVChargerBay) => {
    setIsStationModalOpen(false);
    setIsEVModalOpen(false);
    setActiveAlert({
      title: 'Hardware Session Initiated via QR',
      description: `Contactor relay closed on ${charger.bayNumber}. Charging at ${charger.maxPowerKW} kW.`,
    });
  };

  // Operator Actions
  const handleUpdateStationCharger = (
    stationId: string,
    chargerId: string,
    newStatus: EVChargerBay['status']
  ) => {
    setStations((prev) =>
      prev.map((s) => {
        if (s.id === stationId) {
          return {
            ...s,
            chargers: s.chargers.map((c) =>
              c.id === chargerId ? { ...c, status: newStatus } : c
            ),
          };
        }
        return s;
      })
    );
    setActiveAlert({
      title: 'Operator Update Synced',
      description: `Charger bay status updated to ${newStatus}. Reflected in Explore, TRIPP and Station cards.`,
    });
  };

  const handleUpdateCNGQueue = (stationId: string, deltaWait: number) => {
    setStations((prev) =>
      prev.map((s) => {
        if (s.id === stationId) {
          const newWait = Math.max(2, s.cngQueue.estimatedWaitMinutes + deltaWait);
          const newTotal = Math.max(1, Math.round(newWait / 2.1));
          return {
            ...s,
            cngQueue: {
              ...s.cngQueue,
              estimatedWaitMinutes: newWait,
              totalVehiclesAhead: newTotal,
            },
          };
        }
        return s;
      })
    );
    setActiveAlert({
      title: 'Operator Queue Regulation Active',
      description: `Station queue time adjusted by ${deltaWait > 0 ? `+${deltaWait}` : deltaWait} mins. TRIPP corridor routing alerted.`,
    });
  };

  const handleBroadcastAnnouncement = (stationId: string, announcement: string) => {
    setActiveAlert({
      title: '📢 Operator Facility Announcement Broadcast',
      description: announcement,
    });
  };

  // Demo Controls simulation handlers
  const handleToggleBayState = () => {
    setStations((prev) =>
      prev.map((s) => {
        if (s.id === 'st-hyd-jiocng-gachibowli') {
          const isBay03Available = s.chargers[2]?.status === 'AVAILABLE';
          return {
            ...s,
            chargers: s.chargers.map((c, i) =>
              i === 2 ? { ...c, status: isBay03Available ? 'OCCUPIED' : 'AVAILABLE' } : c
            ),
          };
        }
        return s;
      })
    );
    setActiveAlert({
      title: 'Demo Mechatronics: 150kW Bay Toggled',
      description: 'Bay 03 status updated on Gachibowli Hub live SCADA feed.',
    });
  };

  const handleToggleQueueSpike = () => {
    setStations((prev) =>
      prev.map((s) => {
        if (s.id === 'st-hyd-bhagyanagar-madhapur') {
          const currentWait = s.cngQueue.estimatedWaitMinutes;
          const newWait = currentWait >= 30 ? 7 : 35;
          return {
            ...s,
            cngQueue: {
              ...s.cngQueue,
              estimatedWaitMinutes: newWait,
              totalVehiclesAhead: newWait === 35 ? 16 : 3,
            },
          };
        }
        return s;
      })
    );
    setActiveAlert({
      title: 'Demo Mechatronics: CNG Queue Toggled (5m ↔ 35m)',
      description: 'Madhapur queue altered to demonstrate dynamic TRIPP rerouting.',
    });
  };

  const handleToggleSensorHealth = () => {
    setIsSensorHealthy(!isSensorHealthy);
    setStations((prev) =>
      prev.map((s) => ({
        ...s,
        dataStatus: !isSensorHealthy ? 'LIVE' : 'SIMULATED',
      }))
    );
    setActiveAlert({
      title: isSensorHealthy ? '🔴 Telemetry Link Offline' : '🟢 Telemetry Link Restored',
      description: isSensorHealthy
        ? 'Station sensor heartbeat lost. Routiq displaying graceful fallback with stale data warning.'
        : 'SCADA heartbeat re-established with 99.4% confidence rating.',
    });
  };

  const handleInjectCommunityReport = () => {
    setActiveAlert({
      title: 'Community Report Injected',
      description:
        'Driver at Madhapur reported physical queue 8 vehicles longer than SCADA count. Community confidence recalculating.',
      actionLabel: 'View in Community',
      onAction: () => setCurrentTab('community'),
    });
  };

  const handleTriggerTrafficDelay = () => {
    setActiveAlert({
      title: '🚨 Traffic Anomaly Detected on Hitec City ORR (+14m)',
      description:
        'Ghost Booking Guard: GPS calculates you will arrive after your Green Window. Would you like to exchange for a +30m slot?',
      actionLabel: 'Exchange Window (+30m)',
      onAction: () => {
        if (cngWindows[0]) {
          setActiveExchangeWindow(cngWindows[0]);
          setIsSlotExchangeOpen(true);
        }
      },
    });
  };

  const handleResetDemo = () => {
    setStations(INITIAL_STATIONS);
    setIsSensorHealthy(true);
    setActiveAlert({
      title: 'Demo State Reset',
      description: 'All station queues, bay statuses, and sensor feeds restored to initial baseline.',
    });
  };

  const handleLaunchHyderabadDemo = () => {
    setTrippTargetDestination('Rajiv Gandhi International Airport (RGIA), Shamshabad');
    setCurrentTab('tripp');
    setActiveAlert({
      title: 'Hyderabad Flagship Corridor Loaded',
      description:
        'Hitec City → Airport corridor active. Note how Station B (Gachibowli) is recommended over Station A (Madhapur) because total trip time is 23 mins faster.',
    });
  };

  // If user explicitly logged out, render the clean authentication screen (Section 4 of specification)
  if (isLoggedOut) {
    return (
      <AuthScreen
        onLogin={(profileName, driveType) => {
          setIsLoggedOut(false);
          setUserProfile((prev) => ({ ...prev, name: profileName }));
          setUserDrivePreference(driveType);
          setActiveAlert({
            title: `Welcome back, ${profileName}`,
            description: `Signed in with ${driveType} mobility focus. Garage and preferences loaded.`,
          });
        }}
        onContinueAsDemo={() => {
          setIsLoggedOut(false);
          setActiveAlert({
            title: 'Welcome Demo Driver',
            description: 'Hyderabad smart corridor loaded with live sensor feeds.',
          });
        }}
      />
    );
  }

  // If first launch, show Onboarding Flow
  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={handleCompleteOnboarding} />;
  }

  return (
    <div className="min-h-screen bg-[#07130F] text-[#F6F1E8] flex flex-col font-sans pb-16 md:pb-0">
      {/* Primary Routiq Header with Authentic Logo & Standard 6 Tabs */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        wallet={wallet}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenQR={() => setIsQROpen(true)}
        onOpenOperator={() => setIsOperatorOpen(true)}
      />

      {/* Global Alert Notification Banner */}
      {activeAlert && (
        <div className="bg-amber-950/85 border-b border-[#F3C45B]/50 py-3 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#F3C45B]" />
              <span>
                <strong>{activeAlert.title}:</strong> {activeAlert.description}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {activeAlert.actionLabel && (
                <button
                  onClick={() => {
                    activeAlert.onAction?.();
                    setActiveAlert(null);
                  }}
                  className="px-3 py-1 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-bold rounded transition-colors"
                >
                  {activeAlert.actionLabel}
                </button>
              )}
              <button
                onClick={() => setActiveAlert(null)}
                className="text-[#F6F1E8]/70 hover:text-white px-2 py-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Tab 1: Home (Ultra-Simple by default per Section 4, 5, 6) */}
        {currentTab === 'overview' && (
          <HeroLanding
            onSelectMode={(mode) => {
              if (mode === 'explore-ev') {
                setExploreInitialMode('EV');
                setCurrentTab('explore');
              } else if (mode === 'explore-cng') {
                setExploreInitialMode('CNG');
                setCurrentTab('explore');
              } else if (mode === 'tripp') {
                setCurrentTab('tripp');
              } else if (mode === 'bookings') {
                setCurrentTab('bookings');
              } else if (mode === 'community') {
                setCurrentTab('community');
              } else {
                setCurrentTab('explore');
              }
            }}
            onLaunchDemoScenario={handleLaunchHyderabadDemo}
            activeVehicle={activeVehicle}
            onSelectVehicle={setActiveVehicle}
            vehicles={vehicles}
            stations={stations}
            onSelectStation={(st) => {
              setSelectedStation(st);
              setIsStationModalOpen(true);
            }}
            activeReservation={evReservations[0]}
            activeCngWindow={cngWindows[0]}
            onPlanDestination={(dest) => {
              setTrippTargetDestination(dest);
              setCurrentTab('tripp');
            }}
            onStartActiveJourney={() => setIsActiveJourneyOpen(true)}
            userDrivePreference={userDrivePreference}
          />
        )}

        {/* Tab 2: Explore (Data-rich discovery with EV | CNG toggle and Geographical Map) */}
        {currentTab === 'explore' && (
          <ExploreView
            stations={stations}
            activeVehicle={activeVehicle}
            initialMode={exploreInitialMode}
            onSelectStation={(st) => {
              setSelectedStation(st);
              setIsStationModalOpen(true);
            }}
            onOpenEVModal={(st) => {
              setSelectedStation(st);
              setIsEVModalOpen(true);
            }}
            onOpenCNGModal={(st) => {
              setSelectedStation(st);
              setIsCNGModalOpen(true);
            }}
            onQuickQR={handleQuickQRCharge}
          />
        )}

        {/* Tab 3: TRIPP (Intelligent Route Engine with User-Controlled Targets) */}
        {currentTab === 'tripp' && (
          <TrippPlanner
            vehicle={activeVehicle}
            stations={stations}
            initialDestination={trippTargetDestination}
            onReserveStopCharger={(st) => {
              setSelectedStation(st);
              setIsEVModalOpen(true);
            }}
          />
        )}

        {/* Tab 4: Community (Section 31-35 Dedicated Platform) */}
        {currentTab === 'community' && (
          <CommunityView
            stations={stations}
            onSelectStation={(st) => {
              setSelectedStation(st);
              setIsStationModalOpen(true);
            }}
          />
        )}

        {/* Tab 5: Bookings (Digital passes, QR codes, hold PIN, window exchange) */}
        {currentTab === 'bookings' && (
          <BookingsView
            evReservations={evReservations}
            cngWindows={cngWindows}
            onOpenSlotExchange={(gw) => {
              setActiveExchangeWindow(gw);
              setIsSlotExchangeOpen(true);
            }}
            onSelectStationById={(stationId) => {
              const matched = stations.find((s) => s.id === stationId);
              if (matched) {
                setSelectedStation(matched);
                setIsStationModalOpen(true);
              }
            }}
            onCancelEVBooking={(id) => {
              setEvReservations((prev) => prev.filter((r) => r.id !== id));
            }}
            onCancelCNGWindow={(id) => {
              setCngWindows((prev) => prev.filter((w) => w.id !== id));
            }}
          />
        )}

        {/* Tab 6: Profile (Driver details, garage management, and concise About Routiq) */}
        {currentTab === 'profile' && (
          <ProfileView
            userProfile={userProfile}
            vehicles={vehicles}
            activeVehicle={activeVehicle}
            onSelectVehicle={setActiveVehicle}
            onAddVehicle={(newVeh) => {
              setVehicles((prev) => [...prev, newVeh]);
              setActiveAlert({
                title: 'Vehicle Added to Garage',
                description: `${newVeh.name} (${newVeh.registrationNumber}) is now configured.`,
              });
            }}
            futureInitiatives={futureInitiatives}
            onOpenWallet={() => setIsWalletOpen(true)}
            onRestartOnboarding={handleRestartOnboarding}
            onLogout={() => {
              setIsLoggedOut(true);
            }}
            onUpdateUserProfile={(updated) => {
              setUserProfile((prev) => ({ ...prev, ...updated }));
              setActiveAlert({
                title: 'Profile Updated',
                description: `Profile details for ${updated.name || userProfile.name} saved successfully.`,
              });
            }}
          />
        )}
      </main>

      {/* Presenter & Mechatronics Control Panel (Section 16-22 & 55) */}
      <DemoControlPanel
        onToggleBayState={handleToggleBayState}
        onToggleQueueSpike={handleToggleQueueSpike}
        onTriggerTrafficDelay={handleTriggerTrafficDelay}
        onToggleSensorHealth={handleToggleSensorHealth}
        onInjectCommunityReport={handleInjectCommunityReport}
        onResetDemo={handleResetDemo}
        onOpenOperatorDashboard={() => setIsOperatorOpen(true)}
        isSensorHealthy={isSensorHealthy}
        stations={stations}
      />

      {/* Mobile Bottom Navigation (6 Core Tabs) */}
      <MobileBottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* ACTIVE JOURNEY GUIDANCE OVERLAY (Section 51 & 52) */}
      {isActiveJourneyOpen && (
        <ActiveJourneyOverlay
          vehicle={activeVehicle}
          destination={trippTargetDestination}
          nextStopName="Jio-bp pulse (Gachibowli ORR)"
          distanceKm={18.4}
          etaMinutes={26}
          onExitJourney={() => setIsActiveJourneyOpen(false)}
          onCheckInAtBay={() => {
            setIsActiveJourneyOpen(false);
            setActiveAlert({
              title: 'Arrived at Bay 01',
              description: 'Optical contactor scanner engaged. Charging initiated at 150kW.',
            });
          }}
        />
      )}

      {/* OPERATOR COMMAND CENTER MODAL (Section 54) */}
      {isOperatorOpen && (
        <OperatorDashboardModal
          stations={stations}
          onClose={() => setIsOperatorOpen(false)}
          onUpdateStationCharger={handleUpdateStationCharger}
          onUpdateCNGQueue={handleUpdateCNGQueue}
          onBroadcastAnnouncement={handleBroadcastAnnouncement}
        />
      )}

      {/* MODALS */}
      {/* 1. Station Detail Modal */}
      {isStationModalOpen && selectedStation && (
        <StationDetailModal
          station={selectedStation}
          vehicle={activeVehicle}
          onClose={() => setIsStationModalOpen(false)}
          onOpenEVBooking={(st) => {
            setIsStationModalOpen(false);
            setSelectedStation(st);
            setIsEVModalOpen(true);
          }}
          onOpenCNGBooking={(st) => {
            setIsStationModalOpen(false);
            setSelectedStation(st);
            setIsCNGModalOpen(true);
          }}
          onQuickQRCharge={handleQuickQRCharge}
          onOpenFeedback={() => {
            setIsStationModalOpen(false);
            setCurrentTab('community');
          }}
        />
      )}

      {/* 2. EV Reservation Modal */}
      {isEVModalOpen && selectedStation && (
        <EVReservationModal
          station={selectedStation}
          vehicle={activeVehicle}
          wallet={wallet}
          onClose={() => setIsEVModalOpen(false)}
          onConfirmReservation={handleConfirmEVReservation}
          onQuickQRCharge={handleQuickQRCharge}
        />
      )}

      {/* 3. CNG Green Window Modal */}
      {isCNGModalOpen && selectedStation && (
        <CNGGreenWindowModal
          station={selectedStation}
          vehicle={activeVehicle}
          wallet={wallet}
          onClose={() => setIsCNGModalOpen(false)}
          onAssignWindow={handleAssignCNGWindow}
          onSelectAlternativeStation={(alt) => {
            setSelectedStation(alt);
          }}
          allStations={stations}
        />
      )}

      {/* 4. Wallet Modal */}
      {isWalletOpen && (
        <WalletModal
          wallet={wallet}
          onClose={() => setIsWalletOpen(false)}
          onDeposit={(amount, upiId) => {
            setWallet((prev) => ({
              ...prev,
              availableBalance: prev.availableBalance + amount,
              transactions: [
                {
                  id: `tx-${Date.now()}`,
                  type: 'DEPOSIT',
                  amount,
                  description: `UPI Deposit via ${upiId}`,
                  timestamp: 'Just now',
                  status: 'COMPLETED',
                  receiptId: `REC-RQ-${Math.floor(10000 + Math.random() * 90000)}`,
                },
                ...prev.transactions,
              ],
            }));
          }}
        />
      )}

      {/* 5. QR Scanner Modal */}
      {isQROpen && (
        <QRScannerModal
          stations={stations}
          vehicle={activeVehicle}
          onClose={() => setIsQROpen(false)}
          onSessionStarted={(_chId, stName) => {
            setActiveAlert({
              title: 'Hardware Session Active',
              description: `Vehicle verified. Power relay closed at ${stName}.`,
            });
          }}
        />
      )}

      {/* 6. Slot Exchange Modal */}
      {isSlotExchangeOpen && activeExchangeWindow && (
        <SlotExchangeModal
          activeWindow={activeExchangeWindow}
          station={
            stations.find((s) => s.id === activeExchangeWindow.stationId) || stations[0]
          }
          onClose={() => setIsSlotExchangeOpen(false)}
          onExchangeConfirmed={(updated) => {
            setCngWindows((prev) =>
              prev.map((w) => (w.id === updated.id ? updated : w))
            );
            setActiveAlert({
              title: 'Mutual Window Exchange Confirmed',
              description: `Your new Green Window is ${updated.greenWindowStart} – ${updated.greenWindowEnd}. Arrival staggered smoothly.`,
            });
          }}
        />
      )}
    </div>
  );
}
