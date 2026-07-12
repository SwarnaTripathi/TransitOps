import express from "express";
import { authGuard } from "../../shared/middleware/authGuard.js";
import { getStats } from "./dashboard.controller.js";

const router = express.Router();

// GET /api/dashboard/stats — role-aware stats
router.get("/stats", authGuard, getStats);

export default router;
