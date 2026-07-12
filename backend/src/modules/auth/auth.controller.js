import { loginUser, getCurrentUser } from "./auth.service.js";
import { sendSuccess, sendError } from "../../shared/utils/response.js";

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    return sendSuccess(res, {
      user: result.user,
      token: result.token,
    }, "Login successful");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode, "AUTH_ERROR");
    }
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal, server acknowledges).
 */
const logout = async (req, res) => {
  // JWT is stateless — client destroys the token.
  // Server-side we simply acknowledge the logout.
  return sendSuccess(res, null, "Logged out successfully");
};

/**
 * GET /api/auth/me
 * Get the currently authenticated user's profile.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user._id);
    return sendSuccess(res, user, "Current user retrieved");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode, "NOT_FOUND");
    }
    next(error);
  }
};

export { login, logout, getMe };
