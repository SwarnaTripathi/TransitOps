import { getDashboardStatsByRole } from "./dashboard.service.js";
import { sendSuccess, sendError } from "../../shared/utils/response.js";

/**
 * GET /api/dashboard/stats
 * Returns role-filtered dashboard statistics for the authenticated user.
 */
export const getStats = async (req, res, next) => {
  try {
    const stats = await getDashboardStatsByRole(req.user);
    return sendSuccess(res, stats, "Dashboard stats retrieved");
  } catch (error) {
    next(error);
  }
};
