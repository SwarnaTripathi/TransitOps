import { createContext, useState, useEffect, useCallback } from "react";
import { getMeApi, loginApi, registerApi, logoutApi } from "../../modules/auth/api/authApi.js";
import {
  setAuthData,
  clearAuthData,
  getToken,
  getStoredUser,
} from "../../modules/auth/utils/authHelpers.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify token on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getMeApi();
        if (response.success && response.data) {
          setUser(response.data);
          setAuthData(token, response.data);
        } else {
          clearAuthData();
          setUser(null);
        }
      } catch {
        clearAuthData();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await loginApi(email, password);
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        setAuthData(token, userData);
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: response.message || "Login failed" };
    } catch (err) {
      const message =
        err.response?.data?.error?.message || err.message || "Login failed";
      setError(message);
      return { success: false, message };
    }
  }, []);

  const register = useCallback(async (userData) => {
    setError(null);
    try {
      const response = await registerApi(userData);
      if (response.success && response.data) {
        const { user: userDataResult, token } = response.data;
        setAuthData(token, userDataResult);
        setUser(userDataResult);
        return { success: true };
      }
      return { success: false, message: response.message || "Registration failed" };
    } catch (err) {
      const message =
        err.response?.data?.error?.message || err.message || "Registration failed";
      setError(message);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Logout even if API call fails
    } finally {
      clearAuthData();
      setUser(null);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    role: user?.role || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
