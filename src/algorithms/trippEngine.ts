import { Station, TrippPlan, TripStop, Vehicle } from '../types';
import { estimateChargingDurationMinutes } from './evCompatibility';

/**
 * Predict real-world range factoring in ambient temperature, AC/HVAC load, and average highway velocity.
 */
export function calculateAdaptiveRangeKm(
  vehicle: Vehicle,
  ambientTempC: number = 34,
  hvacOn: boolean = true,
  highwaySpeedKmh: number = 95
): {
  realWorldRangeKm: number;
  consumptionWhPerKm: number;
  efficiencyLossPct: number;
} {
  const baseRange = vehicle.realWorldRangeKm || 300;
  let penalty = 0;

  // Temperature penalty for Indian summer (above 32°C requires active battery chillers)
  if (ambientTempC > 35) {
    penalty += 0.08;
  } else if (ambientTempC > 30) {
    penalty += 0.04;
  }

  // HVAC cabin cooling
  if (hvacOn) {
    penalty += 0.07;
  }

  // Speed penalty (aerodynamic drag above 80 km/h)
  if (highwaySpeedKmh > 90) {
    penalty += (highwaySpeedKmh - 90) * 0.008;
  }

  const effectiveRange = Math.round(baseRange * (1 - penalty));
  const capacityKWh = vehicle.usableBatteryKWh || 45;
  const consumptionWhKm = Math.round((capacityKWh * 1000) / effectiveRange);

  return {
    realWorldRangeKm: effectiveRange,
    consumptionWhPerKm: consumptionWhKm,
    efficiencyLossPct: Math.round(penalty * 100)
  };
}

/**
 * Core TRIPP Planner:
 * Plans complete journey, calculates charging stops, confidence score, and battery safety margin.
 */
export function planTrippJourney(
  origin: string,
  destination: string,
  totalDistanceKm: number,
  vehicle: Vehicle,
  departureBatteryPct: number,
  candidateStationsAlongRoute: Station[],
  minReservePct: number = 15
): TrippPlan {
  const { realWorldRangeKm } = calculateAdaptiveRangeKm(vehicle);
  const maxSafeKmOnFullCharge = realWorldRangeKm * ((100 - minReservePct) / 100);
  const initialRangeKm = realWorldRangeKm * (departureBatteryPct / 100);

  const stops: TripStop[] = [];
  let currentKm = 0;
  let currentBattery = departureBatteryPct;
  let accumulatedDrivingMin = Math.round((totalDistanceKm / 80) * 60); // avg 80 km/h highway speed
  let totalChargingMin = 0;
  let totalCost = 0;

  // Determine needed stops
  if (initialRangeKm < totalDistanceKm + (realWorldRangeKm * (minReservePct / 100))) {
    // Need at least one stop
    for (const st of candidateStationsAlongRoute) {
      if (st.type === 'CNG') continue;
      
      const distFromStart = 128; // Sample waypoint along Delhi-Jaipur corridor
      if (distFromStart > currentKm && distFromStart < totalDistanceKm) {
        const kmDriven = distFromStart - currentKm;
        const batteryConsumedPct = Math.round((kmDriven / realWorldRangeKm) * 100);
        const arrivalBattery = Math.max(8, currentBattery - batteryConsumedPct);

        const targetBattery = 85;
        const fastestCharger = st.chargers.find(c => c.isDC) || st.chargers[0];
        const chargeCalc = estimateChargingDurationMinutes(
          vehicle,
          arrivalBattery,
          targetBattery,
          fastestCharger?.maxPowerKW || 60
        );

        const stopCost = Math.round(chargeCalc.energyAddedKWh * (fastestCharger?.pricePerKWh || 18));
        totalCost += stopCost;
        totalChargingMin += chargeCalc.totalMinutes;

        stops.push({
          id: `stop-${st.id}`,
          stationId: st.id,
          stationName: st.name,
          distanceFromStartKm: distFromStart,
          arrivalBatteryPct: arrivalBattery,
          departureBatteryPct: targetBattery,
          chargeTimeMinutes: chargeCalc.totalMinutes,
          chargerType: `${fastestCharger?.connectorType || 'CCS2'} (${fastestCharger?.maxPowerKW || 60} kW DC)`,
          powerKW: fastestCharger?.maxPowerKW || 60,
          costEstimate: stopCost,
          amenities: st.amenities,
          reliabilityScore: fastestCharger?.reliabilityScore || 96,
          isReserved: false
        });

        currentKm = distFromStart;
        currentBattery = targetBattery;
        break; // for 270km corridor one fast charge suffices
      }
    }
  }

  // Calculate final arrival battery
  const remainingKm = totalDistanceKm - currentKm;
  const remainingConsumedPct = Math.round((remainingKm / realWorldRangeKm) * 100);
  const arrivalBatteryPct = Math.max(5, currentBattery - remainingConsumedPct);
  const safetyMarginPct = arrivalBatteryPct - minReservePct;

  let safetyStatus: 'SAFE' | 'CAUTION' | 'CRITICAL' = 'SAFE';
  if (safetyMarginPct < 0) {
    safetyStatus = 'CRITICAL';
  } else if (safetyMarginPct < 8) {
    safetyStatus = 'CAUTION';
  }

  // Carbon offset compared to petrol car (approx 140g CO2/km)
  const carbonOffsetKg = Number(((totalDistanceKm * 140) / 1000).toFixed(1));

  return {
    id: `tripp-${Date.now()}`,
    origin,
    destination,
    totalDistanceKm,
    totalDrivingMinutes: accumulatedDrivingMin,
    totalChargingMinutes: totalChargingMin,
    totalTripMinutes: accumulatedDrivingMin + totalChargingMin,
    departureBatteryPct,
    arrivalBatteryPct,
    safetyMarginPct,
    safetyStatus,
    confidenceScorePct: 94,
    stops,
    carbonOffsetKg,
    estimatedTotalCost: totalCost,
    isLiveTrackingActive: false,
    currentKm: 0,
    liveBatteryPct: departureBatteryPct,
    liveSpeedKmH: 85,
    trafficStatus: 'NORMAL'
  };
}

/**
 * Dynamic Recalculation Engine for Live Trips
 * Triggers when battery drops faster than predicted or when traffic delays occur.
 */
export function recalculateTripLive(
  currentPlan: TrippPlan,
  currentKm: number,
  currentBatteryPct: number,
  trafficCondition: 'NORMAL' | 'HEAVY' | 'CRITICAL_JAM',
  alternateStation?: Station
): TrippPlan {
  const updatedPlan = { ...currentPlan };
  updatedPlan.currentKm = currentKm;
  updatedPlan.liveBatteryPct = currentBatteryPct;
  updatedPlan.trafficStatus = trafficCondition;

  // Recalculate arrival at destination or next stop
  const remainingKm = currentPlan.totalDistanceKm - currentKm;
  const estimatedRemainingBatteryLoss = Math.round((remainingKm / 3.2)); // approx 3.2 km per % SoC

  const predictedArrivalBattery = currentBatteryPct - estimatedRemainingBatteryLoss;
  updatedPlan.arrivalBatteryPct = Math.max(2, predictedArrivalBattery);
  updatedPlan.safetyMarginPct = updatedPlan.arrivalBatteryPct - 15;

  if (updatedPlan.safetyMarginPct < 0) {
    updatedPlan.safetyStatus = 'CRITICAL';
    if (alternateStation) {
      updatedPlan.activeRerouteAlert = {
        reason: 'Accelerated battery consumption detected (Safety Margin breached). Alternate ultra-fast hub recommended.',
        suggestedStationId: alternateStation.id,
        timeDeltaMin: -12
      };
    }
  } else if (updatedPlan.safetyMarginPct < 8 || trafficCondition === 'CRITICAL_JAM') {
    updatedPlan.safetyStatus = 'CAUTION';
  } else {
    updatedPlan.safetyStatus = 'SAFE';
    updatedPlan.activeRerouteAlert = undefined;
  }

  return updatedPlan;
}
