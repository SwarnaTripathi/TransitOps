import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../modules/auth/hooks/useAuth.js";
import Loader from "./Loader.jsx";

/**
 * ProtectedRoute component.
 * Wraps routes that require authentication.
 * Optionally restricts to specific roles.
 *
 * @param {object} props
 * @param {string[]} [props.allowedRoles] - Roles permitted to access children routes
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
