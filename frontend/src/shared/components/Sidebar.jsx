import { NavLink } from "react-router-dom";
import useAuth from "../../modules/auth/hooks/useAuth.js";

export default function Sidebar() {
  const { user } = useAuth();

  const navItems = [
    { to: "/dashboard", icon: "📊", label: "Dashboard" },
    { to: "/vehicles", icon: "🚛", label: "Vehicles Registry" },
    { to: "/drivers", icon: "👥", label: "Driver Profiles" },
  ];

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">T</div>
        <span>TransitOps</span>
      </div>

      <nav className="nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <span>
              {item.icon} {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* User info card at bottom */}
      <div className="role-switcher-card">
        <div className="role-switcher-title">Logged in as</div>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#fff",
            margin: "0.25rem 0 0.25rem 0",
            fontWeight: 600,
          }}
        >
          {user?.name || "User"}
        </p>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            margin: 0,
          }}
        >
          {user?.role || "—"}
        </p>
      </div>
    </aside>
  );
}
