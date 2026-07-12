import axiosInstance from "../../../shared/api/axios.js";

/**
 * Fetch dashboard statistics (KPI data).
 * @returns {Promise<object>}
 */
export const fetchDashboardStats = async () => {
  const response = await axiosInstance.get("/dashboard/stats");
  return response.data;
};

/**
 * Fetch recent activity logs.
 * @param {number} limit
 * @returns {Promise<object>}
 */
export const fetchActivityLogs = async (limit = 20) => {
  const response = await axiosInstance.get(`/activity-logs?limit=${limit}`);
  return response.data;
};
