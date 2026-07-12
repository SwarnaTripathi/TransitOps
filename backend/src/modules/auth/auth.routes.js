import express from "express";
import { login, logout, getMe } from "./auth.controller.js";
import { validateLogin } from "./auth.validation.js";
import { authGuard } from "../../shared/middleware/authGuard.js";

const router = express.Router();

// POST /api/auth/login - Authenticate user
router.post("/login", validateLogin, login);

// POST /api/auth/logout - Logout (requires auth)
router.post("/logout", authGuard, logout);

// GET /api/auth/me - Get current user profile (requires auth)
router.get("/me", authGuard, getMe);

export default router;
