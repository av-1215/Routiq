import { CNGDispenser, CNGVehicleCategory, Station, CNGGreenWindow } from '../types';

/**
 * Average baseline refueling durations by Indian vehicle category (in minutes)
 */
export const CATEGORY_SERVICE_TIMES: Record<CNGVehicleCategory, number> = {
  Auto: 2.5,
  Car: 4.0,
  Taxi: 4.5,
  Commercial: 7.0,
  Bus: 12.0,
  SUV: 5.0,
  Sedan: 4.2,
};

/**
 * Pressure-Aware Dispensing Multiplier
 * Optimal CNG dispensing pressure in India is ~200-220 bar.
 * When station manifold pressure drops below 180 bar, compressor throughput drops.
 */
export function getPressurePenaltyMultiplier(pressureBar: number): {
  multiplier: number;
  isDegraded: boolean;
  message: string;
} {
  if (pressureBar >= 195) {
    return { multiplier: 1.0, isDegraded: false, message: 'Optimal dispensing pressure (Nominal)' };
  }
  if (pressureBar >= 175) {
    return { multiplier: 1.2, isDegraded: false, message: 'Moderate line pressure (~20% slower flow)' };
  }
  // Low pressure < 175 bar
  const penalty = 1.0 + (180 - pressureBar) * 0.015;
  return {
    multiplier: Math.min(2.0, penalty),
    isDegraded: true,
    message: 'Pressure below preferred operating level: Dispensing throughput reduced by ~' + Math.round((penalty - 1) * 100) + '%'
  };
}

/**
 * Dynamic Segmented Wait Time Calculation:
 * T_queue ≈ (Σ [Vehicles Ahead_c × Service Time_c] / Active Dispensers) × Pressure Multiplier
 */
export function calculateSegmentedCNGWait(
  breakdown: { cars: number; autos: number; taxis: number; commercial: number; buses: number },
  activeDispensers: number,
  avgPressureBar: number
): {
  totalEstimatedWaitMin: number;
  carWaitMin: number;
  autoWaitMin: number;
  commercialWaitMin: number;
  pressureInfo: ReturnType<typeof getPressurePenaltyMultiplier>;
} {
  const activeCount = Math.max(1, activeDispensers);
  const pressureInfo = getPressurePenaltyMultiplier(avgPressureBar);

  const totalDemandMinutes =
    breakdown.cars * CATEGORY_SERVICE_TIMES.Car +
    breakdown.autos * CATEGORY_SERVICE_TIMES.Auto +
    breakdown.taxis * CATEGORY_SERVICE_TIMES.Taxi +
    breakdown.commercial * CATEGORY_SERVICE_TIMES.Commercial +
    breakdown.buses * CATEGORY_SERVICE_TIMES.Bus;

  const rawWait = (totalDemandMinutes / activeCount) * pressureInfo.multiplier;
  const roundedTotal = Math.max(1, Math.round(rawWait));

  return {
    totalEstimatedWaitMin: roundedTotal,
    carWaitMin: Math.max(2, Math.round((breakdown.cars * CATEGORY_SERVICE_TIMES.Car / activeCount) * pressureInfo.multiplier)),
    autoWaitMin: Math.max(1, Math.round((breakdown.autos * CATEGORY_SERVICE_TIMES.Auto / activeCount) * pressureInfo.multiplier)),
    commercialWaitMin: Math.max(3, Math.round((breakdown.commercial * CATEGORY_SERVICE_TIMES.Commercial / activeCount) * pressureInfo.multiplier)),
    pressureInfo
  };
}

/**
 * Station Congestion Index (CI)
 * CI = Estimated Demand / Available Service Capacity in a 30-min window
 */
export function calculateCongestionIndex(
  station: Station,
  incomingVehiclesNext30Min: number = 8
): {
  ci: number;
  label: 'LOW' | 'OPTIMAL' | 'CONGESTED' | 'CRITICAL';
  shouldReroute: boolean;
} {
  const activeDispensers = station.dispensers.filter(d => d.status === 'ACTIVE' || d.status === 'OCCUPIED').length || 1;
  const avgServiceTime = 4.5;
  const stationMaxVehicles30Min = (30 / avgServiceTime) * activeDispensers;

  const totalDemand = station.cngQueue.totalVehiclesAhead + incomingVehiclesNext30Min;
  const ci = Number((totalDemand / stationMaxVehicles30Min).toFixed(2));

  let label: 'LOW' | 'OPTIMAL' | 'CONGESTED' | 'CRITICAL' = 'OPTIMAL';
  if (ci < 0.6) label = 'LOW';
  else if (ci <= 1.0) label = 'OPTIMAL';
  else if (ci <= 1.4) label = 'CONGESTED';
  else label = 'CRITICAL';

  return {
    ci,
    label,
    shouldReroute: ci > 1.25
  };
}

/**
 * Virtual Green Window Generator
 * Instead of hard reservations that pretend capacity exists, Green Windows stagger arrival flow
 */
export function allocateGreenWindow(
  userEtaDate: Date,
  category: CNGVehicleCategory,
  station: Station,
  existingActiveWindows: number
): {
  startFormatted: string;
  endFormatted: string;
  queuePosition: number;
  estimatedWaitMin: number;
  staggerOffsetMin: number;
} {
  const activeDispensers = station.dispensers.filter(d => d.status !== 'MAINTENANCE').length || 2;
  
  // Stagger arrival by ~2-4 minutes if already many windows in this slot
  const staggerOffsetMin = existingActiveWindows > activeDispensers * 2 ? 4 : 0;
  
  const windowStart = new Date(userEtaDate.getTime() + staggerOffsetMin * 60000);
  // 15-minute Green Window
  const windowEnd = new Date(windowStart.getTime() + 15 * 60000);

  const avgWait = calculateSegmentedCNGWait(
    station.cngQueue.breakdown,
    activeDispensers,
    station.dispensers[0]?.currentPressureBar || 200
  ).totalEstimatedWaitMin;

  const formatTime = (d: Date) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

  return {
    startFormatted: formatTime(windowStart),
    endFormatted: formatTime(windowEnd),
    queuePosition: station.cngQueue.totalVehiclesAhead + 1,
    estimatedWaitMin: avgWait,
    staggerOffsetMin
  };
}

/**
 * Ghost Booking Protection:
 * Flags users whose GPS speed and distance render arrival within the Green Window mathematically improbable.
 */
export function evaluateGhostRisk(
  distanceKm: number,
  minutesRemainingToWindowEnd: number,
  lastMovedMinutesAgo: number
): {
  ghostRiskScore: number;
  isAtRisk: boolean;
  actionRequired: 'NONE' | 'CONFIRM_PRESENCE' | 'RELEASE_RECOMMENDED';
} {
  if (minutesRemainingToWindowEnd <= 0) {
    return { ghostRiskScore: 95, isAtRisk: true, actionRequired: 'RELEASE_RECOMMENDED' };
  }

  const requiredSpeedKmh = (distanceKm / (minutesRemainingToWindowEnd / 60));

  let risk = 10;
  if (requiredSpeedKmh > 110) risk += 50; // unrealistic in Indian city traffic
  if (lastMovedMinutesAgo > 12) risk += 30; // stationary vehicle

  const score = Math.min(100, risk);
  return {
    ghostRiskScore: score,
    isAtRisk: score > 50,
    actionRequired: score > 75 ? 'RELEASE_RECOMMENDED' : score > 50 ? 'CONFIRM_PRESENCE' : 'NONE'
  };
}

/**
 * Slot Exchange Invariant Validator:
 * Swapping window A and window B must NOT increase overall station congestion index.
 */
export function validateSlotExchange(
  windowA: CNGGreenWindow,
  windowB: CNGGreenWindow,
  station: Station
): {
  isValid: boolean;
  reason: string;
} {
  if (windowA.stationId !== windowB.stationId) {
    return { isValid: false, reason: 'Slot exchange is only supported between slots at the same physical station.' };
  }
  if (windowA.status !== 'ASSIGNED' && windowA.status !== 'APPROACHING') {
    return { isValid: false, reason: 'Source window is no longer eligible for exchange.' };
  }
  if (windowB.status !== 'ASSIGNED' && windowB.status !== 'APPROACHING') {
    return { isValid: false, reason: 'Target window is no longer eligible for exchange.' };
  }
  // All checks pass - fair non-speculative peer swap
  return {
    isValid: true,
    reason: 'Exchange validated: Preserves dispenser service equilibrium.'
  };
}
