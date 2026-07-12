import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";
import { sendError } from "../utils/response.js";

/**
 * Authentication guard middleware.
 * Verifies the JWT token from the Authorization header and attaches
 * the authenticated user to `req.user`.
 */
const authGuard = async (req, res, next) => {
  try {
    let token = null;

    // Extract token from "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return sendError(res, "Authentication required. Please log in.", 401, "UNAUTHORIZED");
    }

    // Verify token
    const decoded = verifyToken(token);

    // Fetch the user from DB (exclude password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return sendError(res, "User not found. Token may be invalid.", 401, "UNAUTHORIZED");
    }

    if (!user.isActive) {
      return sendError(res, "Account is deactivated. Contact an administrator.", 403, "ACCOUNT_DISABLED");
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, "Session expired. Please log in again.", 401, "TOKEN_EXPIRED");
    }
    if (error.name === "JsonWebTokenError") {
      return sendError(res, "Invalid authentication token.", 401, "INVALID_TOKEN");
    }
    return sendError(res, "Authentication failed.", 401, "AUTH_FAILED");
  }
};

export { authGuard };
