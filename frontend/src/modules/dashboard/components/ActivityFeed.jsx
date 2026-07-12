export default function ActivityFeed({ activities, loading }) {
  if (loading) {
    return (
      <div className="glass-card activity-card">
        <h3 style={{ marginBottom: "1rem" }}>Recent Activity</h3>
        <div className="activity-loading">
          <span className="spinner" />
          <span>Loading activity...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card activity-card">
      <h3 style={{ marginBottom: "1rem" }}>Recent Activity</h3>

      {(!activities || activities.length === 0) ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          No recent activity to display.
        </p>
      ) : (
        <div className="activity-list">
          {activities.map((log, idx) => {
            const entityColors = {
              Vehicle: "var(--color-info)",
              Driver: "var(--color-success)",
              Trip: "var(--accent-color)",
              User: "var(--color-warning)",
              Auth: "var(--color-danger)",
              Maintenance: "var(--color-warning)",
            };

            const borderColor = entityColors[log.entityType] || "var(--accent-color)";

            return (
              <div
                key={log._id || idx}
                className="activity-item"
                style={{ borderLeftColor: borderColor }}
              >
                <div className="activity-action">
                  <span className="activity-entity-badge" style={{ color: borderColor }}>
                    {log.entityType}
                  </span>
                  <span>{log.action}</span>
                </div>
                <div className="activity-time">
                  {log.actor || log.actorName || "System"} •{" "}
                  {new Date(log.timestamp || log.createdAt).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
