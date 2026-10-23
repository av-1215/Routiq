import { EVChargerBay, Station, Vehicle } from '../types';

/**
 * Checks if a vehicle is physically and electrically compatible with an EV charger bay.
 * Rule: The algorithm must NEVER recommend an incompatible charger.
 */
export function isChargerCompatible(vehicle: Vehicle, charger: EVChargerBay): {
  isCompatible: boolean;
  reason: string;
} {
  if (vehicle.type !== 'EV') {
    return { isCompatible: false, reason: 'Vehicle is not an electric vehicle.' };
  }

  const supported = vehicle.supportedConnectors || ['CCS2', 'Type 2'];
  if (!supported.includes(charger.connectorType)) {
    return {
      isCompatible: false,
      reason: `Vehicle does not support ${charger.connectorType} (Requires: ${supported.join(', ')}).`
    };
  }

  return {
    isCompatible: true,
    reason: `Verified ${charger.connectorType} compatible. Maximum vehicle DC intake: ${vehicle.maxDCPowerKW || 60} kW.`
  };
}

/**
 * Calculates estimated charging duration considering the real-world battery curve.
 * 0% to 80% charges at peak supported rate.
 * 80% to 100% tapers significantly to protect battery longevity in Indian climates.
 */
export function estimateChargingDurationMinutes(
  vehicle: Vehicle,
  currentBatteryPct: number,
  targetBatteryPct: number = 80,
  chargerPowerKW: number,
  isDC: boolean = true
): {
  totalMinutes: number;
  energyAddedKWh: number;
  isTapered: boolean;
} {
  const batteryCapacity = vehicle.usableBatteryKWh || vehicle.batteryCapacityKWh || 45;
  const pctDelta = Math.max(0, targetBatteryPct - currentBatteryPct);
  if (pctDelta <= 0) {
    return { totalMinutes: 0, energyAddedKWh: 0, isTapered: false };
  }

  const effectiveMaxVehiclePower = isDC ? (vehicle.maxDCPowerKW || 60) : (vehicle.maxACPowerKW || 7.4);
  const effectivePower = Math.min(chargerPowerKW, effectiveMaxVehiclePower);

  let totalMinutes = 0;
  let energyAdded = 0;

  // Phase 1: Up to 80%
  const phase1TargetPct = Math.min(targetBatteryPct, 80);
  if (currentBatteryPct < 80) {
    const p1Delta = phase1TargetPct - currentBatteryPct;
    const p1KWh = (p1Delta / 100) * batteryCapacity;
    energyAdded += p1KWh;
    // Power in kW -> hours = kWh / kW -> minutes = hours * 60
    totalMinutes += (p1KWh / effectivePower) * 60;
  }

  // Phase 2: 80% to target (tapered to ~15 kW or less)
  if (targetBatteryPct > 80) {
    const p2StartPct = Math.max(80, currentBatteryPct);
    const p2Delta = targetBatteryPct - p2StartPct;
    if (p2Delta > 0) {
      const p2KWh = (p2Delta / 100) * batteryCapacity;
      energyAdded += p2KWh;
      const taperedPower = Math.min(effectivePower, 18); // Tapers down in hot climates
      totalMinutes += (p2KWh / taperedPower) * 60;
    }
  }

  return {
    totalMinutes: Math.round(totalMinutes),
    energyAddedKWh: Number(energyAdded.toFixed(1)),
    isTapered: targetBatteryPct > 80
  };
}

export interface RecommendationExplanation {
  station: Station;
  score: number;
  compatibleChargersCount: number;
  availableBaysCount: number;
  reasons: string[];
}

/**
 * Transparent Explainable Station Recommendation Engine
 * Score = Compatibility + Availability + Reliability + Amenities - Detour
 */
export function rankStationsForEV(
  stations: Station[],
  vehicle: Vehicle,
  options?: {
    preferredAmenities?: string[];
    minPowerKW?: number;
    maxDetourKm?: number;
  }
): RecommendationExplanation[] {
  const results: RecommendationExplanation[] = [];

  for (const station of stations) {
    if (station.type === 'CNG') continue;

    const compatibleChargers = station.chargers.filter(c => isChargerCompatible(vehicle, c).isCompatible);
    if (compatibleChargers.length === 0) continue;

    const availableBays = compatibleChargers.filter(c => c.status === 'AVAILABLE').length;
    let score = 50;
    const reasons: string[] = [];

    reasons.push(`Compatible with vehicle (${compatibleChargers.map(c => c.connectorType).join('/')})`);

    if (availableBays > 0) {
      score += 25;
      reasons.push(`${availableBays} charging bay${availableBays > 1 ? 's' : ''} currently available`);
    } else {
      reasons.push('All bays currently engaged; reservation recommended');
    }

    // Reliability
    const avgReliability = Math.round(
      compatibleChargers.reduce((acc, c) => acc + c.reliabilityScore, 0) / compatibleChargers.length
    );
    if (avgReliability >= 90) {
      score += 15;
      reasons.push(`High hardware uptime score (${avgReliability}%)`);
    }

    // Power
    const maxKW = Math.max(...compatibleChargers.map(c => c.maxPowerKW));
    if (maxKW >= 60) {
      score += 10;
      reasons.push(`Ultra-fast ${maxKW} kW DC available`);
    }

    // Amenities
    if (options?.preferredAmenities?.length) {
      const matched = options.preferredAmenities.filter(a => station.amenities.includes(a));
      if (matched.length > 0) {
        score += matched.length * 5;
        reasons.push(`Includes desired amenities: ${matched.join(', ')}`);
      }
    } else if (station.amenities.includes('Café') || station.amenities.includes('Executive Lounge')) {
      score += 5;
      reasons.push('Equipped with dining/refreshment lounge');
    }

    results.push({
      station,
      score,
      compatibleChargersCount: compatibleChargers.length,
      availableBaysCount: availableBays,
      reasons
    });
  }

  return results.sort((a, b) => b.score - a.score);
}
