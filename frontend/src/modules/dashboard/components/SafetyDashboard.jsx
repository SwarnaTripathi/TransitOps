import { useState, useEffect } from "react";
import { fetchDashboardStats, fetchActivityLogs } from "../api/dashboardApi.js";
import ActivityFeed from "./ActivityFeed.jsx";
import VehicleChart from "./VehicleChart.jsx";

export default function SafetyDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchDashboardStats();
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error("Failed to load safety stats:", err);
      } finally {
        setLoading(false);
      }
    };

    const loadActivities = async () => {
      try {
        setActivityLoading(true);
        const res = await fetchActivityLogs(15);
        if (res.success) setActivities(res.data);
      } catch (err) {
        console.error("Failed to load activity logs:", err);
      } finally {
        setActivityLoading(false);
      }
    };

    load();
    loadActivities();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <span className="spinner spinner-lg" />
        <p>Loading safety dashboard...</p>
      </div>
    );
  }

  const greeting = getGreeting();

  return (
    <div className="role-dashboard safety-dashboard">
      {/* Welcome header */}
      <div className="role-dashboard-header">
        <div className="role-greeting">
          <h1>
            {greeting}, {user?.name || "Officer"} 🛡️
          </h1>
          <p className="role-subtitle">
            Fleet safety & compliance overview
          </p>
        </div>
        <div className="role-badge safety-badge">
          <span className="role-badge-icon">🛡️</span>
          <span>Safety Officer</span>
        </div>
      </div>

      {/* Compliance Risk Cards */}
      <div className="role-cards-grid">
        <div className="glass-card role-stat-card" style={{ borderLeft: `3px solid ${(stats?.complianceRisks ?? 0) > 0 ? '#ef4444' : '#10b981'}` }}>
          <div
            className="role-stat-icon"
            style={{
              background: (stats?.complianceRisks ?? 0) > 0 ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
              color: (stats?.complianceRisks ?? 0) > 0 ? "#ef4444" : "#10b981",
            }}
          >
            ⚠️
          </div>
          <div className="role-stat-info">
            <span className="role-stat-value">{stats?.complianceRisks ?? 0}</span>
            <span className="role-stat-label">Compliance Risks</span>
          </div>
        </div>

        <div className="glass-card role-stat-card">
          <div className="role-stat-icon" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
            🚫
          </div>
          <div className="role-stat-info">
            <span className="role-stat-value">{stats?.suspendedDrivers ?? 0}</span>
            <span className="role-stat-label">Suspended Drivers</span>
          </div>
        </div>

        <div className="glass-card role-stat-card">
          <div className="role-stat-icon" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
            📋
          </div>
          <div className="role-stat-info">
            <span className="role-stat-value">{stats?.expiringLicenses ?? 0}</span>
            <span className="role-stat-label">Expiring Licenses (30d)</span>
          </div>
        </div>

        <div className="glass-card role-stat-card">
          <div className="role-stat-icon" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
            ❌
          </div>
          <div className="role-stat-info">
            <span className="role-stat-value">{stats?.expiredLicenses ?? 0}</span>
            <span className="role-stat-label">Expired Licenses</span>
          </div>
        </div>
      </div>

      {/* Driver Safety Metrics */}
      <div className="role-cards-grid role-cards-grid-3">
        <div className="glass-card role-stat-card">
          <div className="role-stat-icon" style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6" }}>
            👥
          </div>
          <div className="role-stat-info">
            <span className="role-stat-value">{stats?.totalDrivers ?? 0}</span>
            <span className="role-stat-label">Total Drivers</span>
          </div>
        </div>

        <div className="glass-card role-stat-card">
          <div className="role-stat-icon" style={{
            background: (stats?.avgSafetyScore ?? 0) >= 70 ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
            color: (stats?.avgSafetyScore ?? 0) >= 70 ? "#10b981" : "#f59e0b"
          }}>
            🏆
          </div>
          <div className="role-stat-info">
            <span className="role-stat-value">{stats?.avgSafetyScore ?? 0}</span>
            <span className="role-stat-label">Avg Safety Score</span>
          </div>
        </div>

        <div className="glass-card role-stat-card">
          <div className="role-stat-icon" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
            📉
          </div>
          <div className="role-stat-info">
            <span className="role-stat-value">{stats?.lowSafetyScoreDrivers ?? 0}</span>
            <span className="role-stat-label">Low Score Drivers (&lt;70)</span>
          </div>
        </div>
      </div>

      {/* Vehicle Status + Activity */}
      <div className="dashboard-content-grid">
        <div className="dashboard-charts">
          <VehicleChart />
        </div>
        <div className="dashboard-sidebar-content">
          <ActivityFeed activities={activities} loading={activityLoading} />
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
