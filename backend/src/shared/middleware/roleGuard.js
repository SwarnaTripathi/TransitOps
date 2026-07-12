import { sendError } from "../utils/response.js";

/**
 * Role-based access control middleware factory.
 * Returns a middleware that checks if the authenticated user's role
 * is in the list of allowed roles.
 *
 * @param  {...string} allowedRoles - Roles permitted to access the route
 * @returns {Function} Express middleware
 *
 * Usage:
 *   router.get("/admin", authGuard, roleGuard("Admin"), handler);
 *   router.get("/mixed", authGuard, roleGuard("Admin", "Safety Officer"), handler);
 */
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Authentication required.", 401, "UNAUTHORIZED");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role(s): ${allowedRoles.join(", ")}`,
        403,
        "FORBIDDEN"
      );
    }

    next();
  };
};

export { roleGuard };
