export default function KPISection({ stats }) {
  const utilization = stats?.fleetUtilization ?? 0;

  // Determine color based on utilization level
  const getUtilColor = (pct) => {
    if (pct >= 80) return "var(--color-success)";
    if (pct >= 50) return "var(--color-info)";
    if (pct >= 30) return "var(--color-warning)";
    return "var(--color-danger)";
  };

  const color = getUtilColor(utilization);

  return (
    <div className="kpi-section">
      <div className="glass-card utilization-card">
        <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>Fleet Utilization</h3>
        
        <div className="utilization-ring-container">
          <svg viewBox="0 0 120 120" className="utilization-ring">
            {/* Background ring */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="10"
            />
            {/* Foreground ring */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(utilization / 100) * 314.16} 314.16`}
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dasharray 1s ease-in-out" }}
            />
          </svg>
          <div className="utilization-pct" style={{ color }}>
            {utilization}%
          </div>
        </div>

        <div className="utilization-meta">
          <div className="utilization-meta-row">
            <span className="dot" style={{ background: "var(--color-success)" }} />
            <span>Available: {stats?.availableVehicles ?? 0}</span>
          </div>
          <div className="utilization-meta-row">
            <span className="dot" style={{ background: "var(--color-info)" }} />
            <span>Active: {stats?.activeVehicles ?? 0}</span>
          </div>
          <div className="utilization-meta-row">
            <span className="dot" style={{ background: "var(--color-warning)" }} />
            <span>Maintenance: {stats?.vehiclesInMaintenance ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
