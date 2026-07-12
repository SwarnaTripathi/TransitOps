import { useContext } from "react";
import { AuthContext } from "../../../shared/context/AuthContext.jsx";

/**
 * Custom hook to access auth context values.
 * @returns {{ user, loading, error, login, logout, isAuthenticated, role }}
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;
