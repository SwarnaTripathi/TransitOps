import express from "express";
import { listUsers, getUser, addUser, editUser, removeUser } from "./user.controller.js";
import { validateCreateUser, validateUpdateUser } from "./auth.validation.js";
import { authGuard } from "../../shared/middleware/authGuard.js";
import { roleGuard } from "../../shared/middleware/roleGuard.js";

const router = express.Router();

// All user management routes require authentication
router.use(authGuard);

// GET /api/users - List all users (Fleet Manager only)
router.get("/", roleGuard("Fleet Manager"), listUsers);

// GET /api/users/:id - Get single user (Fleet Manager only)
router.get("/:id", roleGuard("Fleet Manager"), getUser);

// POST /api/users - Create user (Fleet Manager only)
router.post("/", roleGuard("Fleet Manager"), validateCreateUser, addUser);

// PUT /api/users/:id - Update user (Fleet Manager only)
router.put("/:id", roleGuard("Fleet Manager"), validateUpdateUser, editUser);

// DELETE /api/users/:id - Deactivate user (Fleet Manager only)
router.delete("/:id", roleGuard("Fleet Manager"), removeUser);

export default router;
