import express from 'express';
import { z } from 'zod';
import { authGuard, requireRole } from '../../shared/middleware/auth.js';
import { validate } from '../../shared/middleware/validate.js';
import {
  createMaintenance,
  closeMaintenance,
  listMaintenance,
} from './maintenanceController.js';

const router = express.Router();

const createMaintenanceSchema = z.object({
  vehicleId: z.string().min(24, "Invalid vehicle ID"),
  type: z.string().min(1, "Type is required"),
  description: z.string().optional(),
  cost: z.number().nonnegative("Cost cannot be negative")
});

// All maintenance routes require authentication
router.use(authGuard);

// GET  /api/maintenance           — list all maintenance logs (optional ?status=Active&vehicleId=...)
router.get("/", listMaintenance);

// POST /api/maintenance           — create a new maintenance log (auto-flips vehicle to "In Shop")
router.post("/", requireRole(["fleet_manager"]), validate(createMaintenanceSchema), createMaintenance);

// PATCH /api/maintenance/:id/close — close a maintenance log (restores vehicle to "Available")
router.patch("/:id/close", requireRole(["fleet_manager"]), closeMaintenance);

export default router;
