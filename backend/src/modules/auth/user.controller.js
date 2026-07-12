import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "./user.service.js";
import { sendSuccess, sendError } from "../../shared/utils/response.js";

/**
 * GET /api/users
 * List all users with optional filters: role, isActive, search
 */
const listUsers = async (req, res, next) => {
  try {
    const { role, isActive, search } = req.query;
    const users = await getAllUsers({ role, isActive, search });
    return sendSuccess(res, users, "Users retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 * Get a single user by ID.
 */
const getUser = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    return sendSuccess(res, user, "User retrieved successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode, "NOT_FOUND");
    }
    next(error);
  }
};

/**
 * POST /api/users
 * Create a new user.
 */
const addUser = async (req, res, next) => {
  try {
    const actorName = req.user ? req.user.name : "System";
    const user = await createUser(req.body, actorName);
    return sendSuccess(res, user, "User created successfully", 201);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode, "CREATE_FAILED");
    }
    next(error);
  }
};

/**
 * PUT /api/users/:id
 * Update an existing user.
 */
const editUser = async (req, res, next) => {
  try {
    const actorName = req.user ? req.user.name : "System";
    const user = await updateUser(req.params.id, req.body, actorName);
    return sendSuccess(res, user, "User updated successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode, "UPDATE_FAILED");
    }
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 * Soft-delete (deactivate) a user.
 */
const removeUser = async (req, res, next) => {
  try {
    const actorName = req.user ? req.user.name : "System";
    const user = await deleteUser(req.params.id, actorName);
    return sendSuccess(res, user, "User deactivated successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode, "DELETE_FAILED");
    }
    next(error);
  }
};

export { listUsers, getUser, addUser, editUser, removeUser };
