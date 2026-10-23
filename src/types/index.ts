export type VehicleType = 'EV' | 'CNG';

export type EVConnectorType = 'CCS2' | 'Type 2' | 'CHAdeMO' | 'GB/T';

export type CNGVehicleCategory = 'Car' | 'Auto' | 'Taxi' | 'Commercial' | 'Bus' | 'SUV' | 'Sedan';

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: VehicleType;
  registrationNumber: string;
  
  // EV specific
  batteryCapacityKWh?: number;
  usableBatteryKWh?: number;
  realWorldRangeKm?: number;
  claimedRangeKm?: number;
  supportedConnectors?: EVConnectorType[];
  connectorType?: string;
  maxDCPowerKW?: number;
  maxACPowerKW?: number;
  efficiencyWhPerKm?: number;
  currentBatteryPct?: number;

  // CNG specific
  cngCategory?: CNGVehicleCategory;
  cylinderCapacityKg?: number;
  cngTankCapacityKg?: number;
  mileageKmPerKg?: number;
  tankPressureRatingBar?: number;
  currentFuelKg?: number;
}

export type StationType = 'EV' | 'CNG' | 'HYBRID';
export type DataStatus = 'LIVE' | 'ESTIMATED' | 'SIMULATED';

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface EVChargerBay {
  id: string;
  bayNumber: string;
  connectorType: EVConnectorType;
  maxPowerKW: number;
  currentPowerKW: number;
  isDC: boolean;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'OFFLINE' | 'CHARGING';
  pricePerKWh: number;
  reliabilityScore: number; // 0-100
  currentSessionUserId?: string;
}

export interface CNGDispenser {
  id: string;
  dispenserNumber: string;
  status: 'ACTIVE' | 'OCCUPIED' | 'MAINTENANCE';
  currentPressureBar: number; // optimal ~200-220 bar
  historicalAvgPressure: number;
  avgDispenseDurationMin: number;
}

export interface Station {
  id: string;
  name: string;
  brand: string; // e.g. Tata Power EZ Charge, Jio-bp pulse, IGL, Adani Total Gas, BPCL, Shell
  type: StationType;
  city: string;
  state: string;
  address: string;
  highwayCorridor?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  operatingHours: string;
  rating: number;
  totalReviews: number;
  verifiedStatus: boolean;
  dataStatus: DataStatus;
  lastSensorUpdateSecondsAgo: number;
  amenities: string[];
  
  // EV specifics
  chargers: EVChargerBay[];
  
  // CNG specifics
  dispensers: CNGDispenser[];
  cngQueue: {
    totalVehiclesAhead: number;
    breakdown: {
      cars: number;
      autos: number;
      taxis: number;
      commercial: number;
      buses: number;
    };
    estimatedWaitMinutes: number;
  };
  congestionIndex: number; // 0.0 - 2.0 (CI > 1.0 means congested)
  cngPricePerKg?: number;
  distanceKm?: number;
  isRecommendedStop?: boolean;
}

export type ReservationStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'APPROACHING'
  | 'ARRIVED'
  | 'CHARGING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'TRANSFERRED';

export interface EVReservation {
  id: string;
  stationId: string;
  stationName: string;
  chargerId: string;
  bayNumber: string;
  connectorType: EVConnectorType;
  powerKW: number;
  vehicleId: string;
  vehicleName: string;
  date: string;
  startTime: string; // e.g. '14:00'
  endTime: string;   // e.g. '14:45'
  durationMinutes: number;
  arrivalWindow: string;
  gracePeriodMinutes: number;
  totalAmount: number;
  status: ReservationStatus;
  qrCodeToken: string;
  createdAt: string;
  transferredToUserId?: string;
}

export type GreenWindowStatus = 
  | 'ASSIGNED'
  | 'APPROACHING'
  | 'ARRIVED'
  | 'REFUELLING'
  | 'COMPLETED'
  | 'LATE_WARNING'
  | 'EXCHANGED'
  | 'RESCHEDULED'
  | 'CANCELLED';

export interface CNGGreenWindow {
  id: string;
  stationId: string;
  stationName: string;
  vehicleId: string;
  vehicleName: string;
  category: CNGVehicleCategory;
  etaTime: string; // e.g. '16:12'
  greenWindowStart: string; // e.g. '16:10'
  greenWindowEnd: string;   // e.g. '16:25'
  queuePosition: number;
  estimatedWaitMinutes: number;
  status: GreenWindowStatus;
  ghostRiskScore: number; // 0-100%
  trafficDelayMinutes: number;
  qrToken: string;
  createdAt: string;
}

export interface TripStop {
  id: string;
  stationId: string;
  stationName: string;
  distanceFromStartKm: number;
  arrivalBatteryPct: number;
  departureBatteryPct: number;
  chargeTimeMinutes: number;
  chargerType: string;
  powerKW: number;
  costEstimate: number;
  amenities: string[];
  reliabilityScore: number;
  isReserved: boolean;
}

export interface TrippPlan {
  id: string;
  origin: string;
  destination: string;
  totalDistanceKm: number;
  totalDrivingMinutes: number;
  totalChargingMinutes: number;
  totalTripMinutes: number;
  departureBatteryPct: number;
  arrivalBatteryPct: number;
  safetyMarginPct: number;
  safetyStatus: 'SAFE' | 'CAUTION' | 'CRITICAL';
  confidenceScorePct: number;
  stops: TripStop[];
  carbonOffsetKg: number;
  estimatedTotalCost: number;
  // Live trip simulation tracking
  isLiveTrackingActive: boolean;
  currentKm: number;
  liveBatteryPct: number;
  liveSpeedKmH: number;
  trafficStatus: 'NORMAL' | 'HEAVY' | 'CRITICAL_JAM';
  activeRerouteAlert?: {
    reason: string;
    suggestedStationId: string;
    timeDeltaMin: number;
  };
}

export interface WalletTransaction {
  id: string;
  type: 'DEPOSIT' | 'EV_CHARGE' | 'CNG_REFUEL' | 'RESERVATION_HOLD' | 'RESERVATION_RELEASE' | 'WITHDRAWAL';
  amount: number;
  description: string;
  timestamp: string;
  status: 'COMPLETED' | 'PENDING' | 'REFUNDED';
  receiptId: string;
}

export interface Wallet {
  availableBalance: number;
  reservedBalance: number;
  transactions: WalletTransaction[];
}

export interface FeedbackItem {
  id: string;
  stationId: string;
  stationName: string;
  userEmail: string;
  category: 'STATION' | 'CHARGER' | 'CNG_PRESSURE' | 'QUEUE_ACCURACY' | 'APP';
  rating: number; // 1-5
  comment: string;
  timestamp: string;
  upvotes: number;
  resolved: boolean;
}

export interface UserMobilityProfile {
  name: string;
  email: string;
  city: string;
  role: 'COMMUTER' | 'CAB_DRIVER' | 'FLEET_OPERATOR' | 'HIGHWAY_TRAVELER';
  vehicleType: string;
  dailyCommuteKm: number;
  targetCO2OffsetKg: number;
  smartGridOptIn: boolean;
  publicTransitSynergyOptIn: boolean;
  notes?: string;
  calculatedImpact: {
    co2SavedKg: number;
    moneySavedINR: number;
    queueMinutesSaved: number;
  };
}

export interface FutureInitiative {
  id: string;
  title: string;
  iconName: string;
  status: 'ACTIVE_PILOT' | 'BETA_INTEGRATED' | 'RESEARCH_PHASE' | 'PRODUCTION_READY';
  summary: string;
  description?: string;
  readinessStatus?: string;
  impactMetric?: string;
  scalabilitySpec: string;
  indianContext: string;
}

export interface RouteComparisonOption {
  type: 'FASTEST' | 'CHEAPEST' | 'LOWEST_WAIT' | 'GREENEST';
  title: string;
  durationMinutes: number;
  distanceKm: number;
  costINR: number;
  co2OffsetKg: number;
  queueMinutes: number;
  stopName: string;
  stopType: 'EV' | 'CNG';
  badge: string;
  recommendedReason: string;
}

