import { useState, useEffect } from "react";
import { fetchDashboardStats } from "../api/dashboardApi.js";

export default function DriverDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchDashboardStats();
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error("Failed to load driver stats:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <span className="spinner spinner-lg" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const greeting = getGreeting();

  return (
    <div className="role-dashboard driver-dashboard">
      {/* Welcome header */}
      <div className="role-dashboard-header">
        <div className="role-greeting">
          <h1>
            {greeting}, {user?.name || "Driver"} 👋
          </h1>
          <p className="role-subtitle">Here's your trip overview for today</p>
        </div>
        <div className="role-badge driver-badge">
          <span className="role-badge-icon">🚛</span>
          <span>Driver</span>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="role-cards-grid">
        <div className="glass-card role-stat-card">
          <div className="role-stat-icon" style={{ background: "rgba(99,102,241,0.15)", color: "#6366f1" }}>
            🛣️
          </div>
          <div className="role-stat-info">
            <span className="role-stat-value">{stats?.activeTrips ?? 0}</span>
            <span className="role-stat-label">Active Trips</span>
          </div>
        </div>

        <div className="glass-card role-stat-card">
          <div className="role-stat-icon" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
            ✅
          </div>
          <div className="role-stat-info">
            <span className="role-stat-value">{stats?.completedTrips ?? 0}</span>
            <span className="role-stat-label">Completed</span>
          </div>
        </div>

        <div className="glass-card role-stat-card">
          <div className="role-stat-icon" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
            ⏳
          </div>
          <div className="role-stat-info">
            <span className="role-stat-value">{stats?.pendingTrips ?? 0}</span>
            <span className="role-stat-label">Pending</span>
          </div>
        </div>

        <div className="glass-card role-stat-card">
          <div className="role-stat-icon" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
            🚫
          </div>
          <div className="role-stat-info">
            <span className="role-stat-value">{stats?.cancelledTrips ?? 0}</span>
            <span className="role-stat-label">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="role-summary-grid">
        <div className="glass-card role-summary-card">
          <h3>📊 Trip Summary</h3>
          <div className="role-summary-rows">
            <div className="role-summary-row">
              <span>Total Trips</span>
              <strong>{stats?.totalTrips ?? 0}</strong>
            </div>
            <div className="role-summary-row">
              <span>Total Distance Covered</span>
              <strong>{stats?.totalDistance ?? 0} km</strong>
            </div>
            <div className="role-summary-row">
              <span>Total Fuel Consumed</span>
              <strong>{stats?.totalFuel ?? 0} L</strong>
            </div>
            <div className="role-summary-row">
              <span>Avg Distance per Trip</span>
              <strong>
                {stats?.completedTrips > 0
                  ? Math.round(stats.totalDistance / stats.completedTrips)
                  : 0}{" "}
                km
              </strong>
            </div>
          </div>
        </div>

        <div className="glass-card role-summary-card">
          <h3>💡 Quick Actions</h3>
          <div className="role-quick-actions">
            <a href="/trips" className="role-action-btn">
              <span>📋</span> View My Trips
            </a>
          </div>
          <div className="role-tip">
            <p>
              <strong>Tip:</strong> Keep your trip logs updated to maintain a high performance score.
              Complete trips on time and log accurate fuel readings.
            </p>
          </div>
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
