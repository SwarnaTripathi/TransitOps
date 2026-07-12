import express from 'express';
import { authGuard, requireRole } from '../../shared/middleware/auth.js';
import {
  fuelEfficiencyReport,
  utilizationReport,
  costReport,
  roiReport,
  exportCsv,
} from './reportController.js';

const router = express.Router();

router.use(authGuard);

router.get("/fuel-efficiency", fuelEfficiencyReport);
router.get("/utilization", utilizationReport);
router.get("/cost", requireRole(["fleet_manager", "financial_analyst"]), costReport);
router.get("/roi", requireRole(["fleet_manager", "financial_analyst"]), roiReport);
router.get("/export.csv", requireRole(["fleet_manager", "financial_analyst"]), exportCsv);

export default router;
