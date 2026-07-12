import Vehicle from '../vehicles/Vehicle.js';
import MaintenanceLog from '../maintenance/MaintenanceLog.js';
import { FuelLog } from '../fuelExpense/FuelExpense.js';
import Trip from '../trips/Trip.js'; // Member C's model stub

// GET /api/reports/fuel-efficiency
export async function fuelEfficiencyReport(req, res) {
  try {
    const logs = await FuelLog.find().populate("vehicleId", "regNumber type");
    const grouped = {};
    for (const log of logs) {
      const key = log.vehicleId?._id?.toString();
      if (!key) continue;
      if (!grouped[key]) {
        grouped[key] = {
          vehicleId: key,
          regNumber: log.vehicleId.regNumber,
          type: log.vehicleId.type,
          logs: [],
        };
      }
      grouped[key].logs.push(log.actualEfficiency);
    }

    const result = Object.values(grouped).map((v) => ({
      vehicleId: v.vehicleId,
      regNumber: v.regNumber,
      type: v.type,
      avgEfficiency: Number(
        (v.logs.reduce((a, b) => a + b, 0) / v.logs.length).toFixed(2)
      ),
    }));

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
}

// GET /api/reports/utilization
export async function utilizationReport(req, res) {
  try {
    const totalVehicles = await Vehicle.countDocuments({ status: { $ne: "Retired" } });
    const onTrip = await Vehicle.countDocuments({ status: "On Trip" });
    const utilizationPct = totalVehicles > 0 ? (onTrip / totalVehicles) * 100 : 0;

    return res.json({
      success: true,
      data: {
        totalVehicles,
        onTrip,
        utilizationPct: Number(utilizationPct.toFixed(1)),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
}

// GET /api/reports/cost  -> operational cost per vehicle (Fuel + Maintenance)
export async function costReport(req, res) {
  try {
    const vehicles = await Vehicle.find();
    const results = [];

    for (const vehicle of vehicles) {
      const fuelLogs = await FuelLog.find({ vehicleId: vehicle._id });
      const maintenanceLogs = await MaintenanceLog.find({ vehicleId: vehicle._id });

      const fuelCost = fuelLogs.reduce((sum, l) => sum + l.cost, 0);
      const maintenanceCost = maintenanceLogs.reduce((sum, l) => sum + l.cost, 0);

      results.push({
        vehicleId: vehicle._id,
        regNumber: vehicle.regNumber,
        fuelCost,
        maintenanceCost,
        totalOperationalCost: fuelCost + maintenanceCost,
      });
    }

    return res.json({ success: true, data: results });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
}

// GET /api/reports/roi  -> ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
export async function roiReport(req, res) {
  try {
    const vehicles = await Vehicle.find();
    const results = [];

    for (const vehicle of vehicles) {
      const fuelLogs = await FuelLog.find({ vehicleId: vehicle._id });
      const maintenanceLogs = await MaintenanceLog.find({ vehicleId: vehicle._id });
      const trips = await Trip.find({ vehicleId: vehicle._id, status: "Completed" });

      const fuelCost = fuelLogs.reduce((sum, l) => sum + l.cost, 0);
      const maintenanceCost = maintenanceLogs.reduce((sum, l) => sum + l.cost, 0);
      const revenue = trips.reduce((sum, t) => sum + (t.revenue || 0), 0);

      const roi =
        vehicle.acquisitionCost > 0
          ? (revenue - (maintenanceCost + fuelCost)) / vehicle.acquisitionCost
          : 0;

      results.push({
        vehicleId: vehicle._id,
        regNumber: vehicle.regNumber,
        revenue,
        fuelCost,
        maintenanceCost,
        acquisitionCost: vehicle.acquisitionCost,
        roi: Number(roi.toFixed(3)), // e.g. 0.15 = 15% return
      });
    }

    // Sort descending — doubles as the "Vehicle Profitability Leaderboard"
    results.sort((a, b) => b.roi - a.roi);

    return res.json({ success: true, data: results });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
}

// GET /api/reports/export.csv
export async function exportCsv(req, res) {
  try {
    const vehicles = await Vehicle.find();
    const rows = [];

    for (const vehicle of vehicles) {
      const fuelLogs = await FuelLog.find({ vehicleId: vehicle._id });
      const maintenanceLogs = await MaintenanceLog.find({ vehicleId: vehicle._id });
      const fuelCost = fuelLogs.reduce((sum, l) => sum + l.cost, 0);
      const maintenanceCost = maintenanceLogs.reduce((sum, l) => sum + l.cost, 0);

      rows.push({
        regNumber: vehicle.regNumber,
        type: vehicle.type,
        status: vehicle.status,
        fuelCost,
        maintenanceCost,
        totalOperationalCost: fuelCost + maintenanceCost,
      });
    }

    const headers = Object.keys(rows[0] || { regNumber: "", type: "", status: "", fuelCost: "", maintenanceCost: "", totalOperationalCost: "" });
    const csvLines = [
      headers.join(","),
      ...rows.map((row) => headers.map((h) => row[h]).join(",")),
    ];
    const csv = csvLines.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=transitops_report.csv");
    return res.send(csv);
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
}
