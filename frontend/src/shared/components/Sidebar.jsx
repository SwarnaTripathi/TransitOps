import { NavLink } from "react-router-dom";
import useAuth from "../../modules/auth/hooks/useAuth.js";

/**
 * Role-based navigation configuration.
 * Each nav item specifies which roles can see it.
 */
const allNavItems = [
  {
    to: "/dashboard",
    icon: "📊",
    label: "Dashboard",
    roles: ["Fleet Manager", "Driver", "Safety Officer", "Financial Analyst"],
  },
  {
    to: "/vehicles",
    icon: "🚛",
    label: "Vehicles Registry",
    roles: ["Fleet Manager", "Safety Officer"],
  },
  {
    to: "/drivers",
    icon: "👥",
    label: "Driver Profiles",
    roles: ["Fleet Manager", "Safety Officer"],
  },
  {
    to: "/trips",
    icon: "📋",
    label: "Trip Dispatch",
    roles: ["Fleet Manager", "Driver"],
  },
  {
    to: "/maintenance",
    icon: "🔧",
    label: "Maintenance",
    roles: ["Fleet Manager", "Safety Officer"],
  },
  {
    to: "/fuel",
    icon: "⛽",
    label: "Fuel & Expenses",
    roles: ["Fleet Manager", "Financial Analyst"],
  },
  {
    to: "/reports",
    icon: "📊",
    label: "Reports",
    roles: ["Fleet Manager", "Safety Officer", "Financial Analyst"],
  },
];

export default function Sidebar() {
  const { user } = useAuth();
  const userRole = user?.role || "Driver";

  // Filter nav items based on the user's role
  const navItems = allNavItems.filter((item) => item.roles.includes(userRole));

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
