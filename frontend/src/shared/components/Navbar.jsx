import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../modules/auth/hooks/useAuth.js";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  // Get initials from user name
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/vehicles": "Vehicle Registry",
    "/drivers": "Driver Profiles",
    "/trips": "Trip Dispatch",
    "/maintenance": "Maintenance",
    "/fuel": "Fuel & Expenses",
    "/reports": "Reports",
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h2 className="navbar-title">
          {pageTitles[location.pathname] || "TransitOps"}
        </h2>
      </div>

      <div className="navbar-right">
        <div className="navbar-user-info">
          <div className="navbar-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="navbar-user-meta">
            <span className="navbar-user-name">{user?.name || "User"}</span>
            <span className="navbar-user-role">{user?.role || "—"}</span>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </header>
  );
}
