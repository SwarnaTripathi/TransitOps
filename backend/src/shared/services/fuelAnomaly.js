// shared/services/fuelAnomaly.js
// Feature 1 — Fuel Anomaly Detection (Member D)
// Flags a fuel log as suspicious if its actual efficiency is significantly
// worse than the vehicle's own history (or a type baseline if no history yet).

export const BASELINE_EFFICIENCY_KM_PER_LITER = {
  van: 12,
  truck: 6,
  pickup: 9,
  bike: 35,
  default: 10,
};

const FLAG_THRESHOLD_PCT = 0.25; // flag if actual is >25% worse than expected

function average(nums) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * Evaluate a fuel log against historical efficiency to detect anomalies.
 * @param {{ distance: number, liters: number }} log - the new fuel log being evaluated
 * @param {Array<{ actualEfficiency: number }>} vehicleHistory - this vehicle's previous fuel logs
 * @param {string} vehicleType - e.g. 'van' | 'truck' | 'pickup' | 'bike'
 * @returns {{ actualEfficiency: number, expectedEfficiency: number, deviationPct: number, flagged: boolean }}
 */
export function evaluateFuelLog(log, vehicleHistory = [], vehicleType = "default") {
  if (!log.liters || log.liters <= 0) {
    throw new Error("liters must be a positive number");
  }

  const actualEfficiency = log.distance / log.liters;

  const expectedEfficiency = vehicleHistory.length
    ? average(vehicleHistory.map((l) => l.actualEfficiency))
    : BASELINE_EFFICIENCY_KM_PER_LITER[vehicleType] ||
      BASELINE_EFFICIENCY_KM_PER_LITER.default;

  const deviationPct =
    expectedEfficiency > 0
      ? (expectedEfficiency - actualEfficiency) / expectedEfficiency
      : 0;

  const flagged = deviationPct > FLAG_THRESHOLD_PCT;

  return {
    actualEfficiency: Number(actualEfficiency.toFixed(2)),
    expectedEfficiency: Number(expectedEfficiency.toFixed(2)),
    deviationPct: Number((deviationPct * 100).toFixed(1)), // stored as percentage
    flagged,
  };
}
