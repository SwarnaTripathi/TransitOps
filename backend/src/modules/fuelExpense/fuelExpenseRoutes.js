import express from 'express';
import { z } from 'zod';
import { authGuard } from '../../shared/middleware/auth.js';
import { validate } from '../../shared/middleware/validate.js';
import {
  createFuelLog,
  listFuelLogs,
  createExpense,
  listExpenses,
} from './fuelExpenseController.js';

const router = express.Router();

// Validation Schemas
const createFuelLogSchema = z.object({
  vehicleId: z.string().min(24, "Invalid vehicle ID"),
  liters: z.number().positive("Liters must be greater than 0"),
  cost: z.number().nonnegative("Cost cannot be negative"),
  distance: z.number().nonnegative("Distance cannot be negative"),
  date: z.string().datetime().optional()
});

const createExpenseSchema = z.object({
  vehicleId: z.string().min(24, "Invalid vehicle ID"),
  type: z.enum(["toll", "other"]).optional(),
  amount: z.number().nonnegative("Amount cannot be negative"),
  note: z.string().optional(),
  date: z.string().datetime().optional()
});

router.use(authGuard);

router.post("/fuel-logs", validate(createFuelLogSchema), createFuelLog);
router.get("/fuel-logs", listFuelLogs);
router.post("/expenses", validate(createExpenseSchema), createExpense);
router.get("/expenses", listExpenses);

export default router;
