import { FuelLog, Expense } from './FuelExpense.js';
import Vehicle from '../vehicles/Vehicle.js';
import { evaluateFuelLog } from '../../shared/services/fuelAnomaly.js';
import { logActivity } from '../../shared/services/logActivity.js';

// POST /api/fuel/fuel-logs
export async function createFuelLog(req, res) {
  try {
    const { vehicleId, liters, cost, distance, date } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, error: { code: "NOT_FOUND", message: "Vehicle not found" } });
    }

    // Pull this vehicle's last 5 logs to build the rolling-average baseline
    const history = await FuelLog.find({ vehicleId, isDeleted: false })
      .sort({ date: -1 })
      .limit(5)
      .select("actualEfficiency");

    const { actualEfficiency, expectedEfficiency, deviationPct, flagged } =
      evaluateFuelLog({ distance, liters }, history, vehicle.type);

    const log = await FuelLog.create({
      vehicleId,
      liters,
      cost,
      distance,
      date: date || new Date(),
      actualEfficiency,
      expectedEfficiency,
      deviationPct,
      flagged,
    });

    if (flagged) {
      await logActivity({
        actor: req.user,
        action: `⚠ Fuel anomaly flagged on ${vehicle.regNumber} (${deviationPct}% below expected efficiency)`,
        entityType: "Maintenance", // Using Maintenance to avoid modifying teammate's ActivityLog schema enum
        entityId: vehicle._id,
      });
    }

    return res.status(201).json({ success: true, data: log });
  } catch (err) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: err.message } });
  }
}

// GET /api/fuel/fuel-logs?vehicleId=&flagged=true
export async function listFuelLogs(req, res) {
  try {
    const { vehicleId, flagged } = req.query;
    const filter = { isDeleted: false };
    if (vehicleId) filter.vehicleId = vehicleId;
    if (flagged !== undefined) filter.flagged = flagged === "true";

    const logs = await FuelLog.find(filter)
      .populate("vehicleId", "regNumber name type")
      .sort({ date: -1 });

    return res.json({ success: true, data: logs });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
}

// POST /api/fuel/expenses
export async function createExpense(req, res) {
  try {
    const { vehicleId, type, amount, date, note } = req.body;
    
    // Check vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, error: { code: "NOT_FOUND", message: "Vehicle not found" } });
    }

    const expense = await Expense.create({ vehicleId, type, amount, date, note });
    return res.status(201).json({ success: true, data: expense });
  } catch (err) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: err.message } });
  }
}

// GET /api/fuel/expenses?vehicleId=
export async function listExpenses(req, res) {
  try {
    const { vehicleId } = req.query;
    const filter = { isDeleted: false };
    if (vehicleId) filter.vehicleId = vehicleId;
    const expenses = await Expense.find(filter).sort({ date: -1 });
    return res.json({ success: true, data: expenses });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
}
