import axiosInstance from "../../../shared/api/axios.js";

/**
 * Login with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object, token: string}>}
 */
export const loginApi = async (email, password) => {
  const response = await axiosInstance.post("/auth/login", { email, password });
  return response.data;
};

/**
 * Register a new user.
 * @param {object} userData
 * @returns {Promise<{user: object, token: string}>}
 */
export const registerApi = async (userData) => {
  const response = await axiosInstance.post("/auth/register", userData);
  return response.data;
};

/**
 * Logout the current user.
 * @returns {Promise<object>}
 */
export const logoutApi = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

/**
 * Get the currently authenticated user's profile.
 * @returns {Promise<object>}
 */
export const getMeApi = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};

/**
 * Forgot password request (placeholder for future implementation).
 * @param {string} email
 * @returns {Promise<object>}
 */
export const forgotPasswordApi = async (email) => {
  // Placeholder: in a real app this would hit a /auth/forgot-password endpoint
  return {
    success: true,
    message: "If an account with that email exists, a reset link has been sent.",
  };
};
