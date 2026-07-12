export default function DashboardCards({ stats }) {
  const cards = [
    {
      title: "Active Vehicles",
      value: stats?.activeVehicles ?? "—",
      icon: "🚛",
      color: "var(--color-info)",
      glow: "var(--color-info-glow)",
    },
    {
      title: "Available Vehicles",
      value: stats?.availableVehicles ?? "—",
      icon: "✅",
      color: "var(--color-success)",
      glow: "var(--color-success-glow)",
    },
    {
      title: "In Maintenance",
      value: stats?.vehiclesInMaintenance ?? "—",
      icon: "🔧",
      color: "var(--color-warning)",
      glow: "var(--color-warning-glow)",
    },
    {
      title: "Active Trips",
      value: stats?.activeTrips ?? "—",
      icon: "🛣️",
      color: "var(--accent-color)",
      glow: "var(--accent-glow)",
    },
    {
      title: "Pending Trips",
      value: stats?.pendingTrips ?? "—",
      icon: "⏳",
      color: "var(--color-warning)",
      glow: "var(--color-warning-glow)",
    },
    {
      title: "Drivers On Duty",
      value: stats?.driversOnDuty ?? "—",
      icon: "👤",
      color: "var(--color-info)",
      glow: "var(--color-info-glow)",
    },
  ];

  return (
    <div className="dashboard-grid">
      {cards.map((card) => (
        <div className="glass-card kpi-card" key={card.title}>
          <div className="kpi-card-header">
            <span className="kpi-icon" style={{ background: card.glow, color: card.color }}>
              {card.icon}
            </span>
          </div>
          <div className="kpi-title">{card.title}</div>
          <div className="kpi-value" style={{ color: card.color }}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
