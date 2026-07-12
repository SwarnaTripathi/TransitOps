import MaintenanceLog from './MaintenanceLog.js';
import Vehicle from '../vehicles/Vehicle.js';
import { setVehicleStatus } from '../../shared/services/statusEngine.js';
import { logActivity } from '../../shared/services/logActivity.js';

// POST /api/maintenance
// Creating an Active maintenance record automatically flips vehicle -> "In Shop"
export async function createMaintenance(req, res) {
  try {
    const { vehicleId, type, description, cost } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, error: { code: "NOT_FOUND", message: "Vehicle not found" } });
    }
    if (vehicle.status === "Retired") {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_STATE", message: "Cannot open maintenance on a Retired vehicle" },
      });
    }

    const log = await MaintenanceLog.create({
      vehicleId,
      type,
      description,
      cost,
      status: "Active",
      openedAt: new Date(),
    });

    // Auto-flip vehicle status to "In Shop"
    await setVehicleStatus(vehicleId, "In Shop", {
      actorId: req.user?._id,
      actorName: req.user?.name,
    });

    await logActivity({
      actor: req.user,
      action: `${req.user?.name || "Someone"} opened maintenance (${type}) on ${vehicle.regNumber}`,
      entityType: "Maintenance",
      entityId: log._id,
    });

    return res.status(201).json({ success: true, data: log });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
}

// PATCH /api/maintenance/:id/close
// Closing maintenance restores the vehicle to Available, UNLESS it's Retired
export async function closeMaintenance(req, res) {
  try {
    const log = await MaintenanceLog.findById(req.params.id);
    if (!log) {
      return res
        .status(404)
        .json({ success: false, error: { code: "NOT_FOUND", message: "Maintenance log not found" } });
    }
    if (log.status === "Closed") {
      return res.status(400).json({
        success: false,
        error: { code: "ALREADY_CLOSED", message: "This maintenance log is already closed" },
      });
    }

    log.status = "Closed";
    log.closedAt = new Date();
    await log.save();

    const vehicle = await Vehicle.findById(log.vehicleId);
    if (vehicle && vehicle.status !== "Retired") {
      await setVehicleStatus(log.vehicleId, "Available", {
        actorId: req.user?._id,
        actorName: req.user?.name,
      });
    }

    await logActivity({
      actor: req.user,
      action: `${req.user?.name || "Someone"} closed maintenance on ${vehicle?.regNumber || log.vehicleId}`,
      entityType: "Maintenance",
      entityId: log._id,
    });

    return res.json({ success: true, data: log });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
}

// GET /api/maintenance
export async function listMaintenance(req, res) {
  try {
    const { status, vehicleId } = req.query;
    const filter = { isDeleted: false };
    if (status) filter.status = status;
    if (vehicleId) filter.vehicleId = vehicleId;

    const logs = await MaintenanceLog.find(filter)
      .populate("vehicleId", "regNumber name type")
      .sort({ openedAt: -1 });

    return res.json({ success: true, data: logs });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
}
