import express from 'express';
import { authGuard, requireRole } from '../../shared/middleware/auth.js';
import {
  createMaintenance,
  closeMaintenance,
  listMaintenance,
} from './maintenanceController.js';

const router = express.Router();

// All maintenance routes require authentication
router.use(authGuard);

// GET  /api/maintenance           — list all maintenance logs (optional ?status=Active&vehicleId=...)
router.get("/", listMaintenance);

// POST /api/maintenance           — create a new maintenance log (auto-flips vehicle to "In Shop")
router.post("/", requireRole(["fleet_manager"]), createMaintenance);

// PATCH /api/maintenance/:id/close — close a maintenance log (restores vehicle to "Available")
router.patch("/:id/close", requireRole(["fleet_manager"]), closeMaintenance);

export default router;
