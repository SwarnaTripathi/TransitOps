import express from 'express';
import { authGuard } from '../../shared/middleware/auth.js';
import {
  createFuelLog,
  listFuelLogs,
  createExpense,
  listExpenses,
} from './fuelExpenseController.js';

const router = express.Router();

router.use(authGuard);

router.post("/fuel-logs", createFuelLog);
router.get("/fuel-logs", listFuelLogs);
router.post("/expenses", createExpense);
router.get("/expenses", listExpenses);

export default router;
