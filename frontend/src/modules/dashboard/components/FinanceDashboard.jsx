import { useState, useEffect } from "react";
import { fetchDashboardStats } from "../api/dashboardApi.js";
import UtilizationChart from "./UtilizationChart.jsx";
import KPISection from "./KPISection.jsx";

export default function FinanceDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchDashboardStats();
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error("Failed to load finance stats:", err);
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
        <p>Loading financial dashboard...</p>
      </div>
    );
  }

  const greeting = getGreeting();
  const profitColor = (stats?.netProfit ?? 0) >= 0 ? "#10b981" : "#ef4444";

  return (
    <div className="role-dashboard finance-dashboard">
      {/* Welcome header */}
      <div className="role-dashboard-header">
        <div className="role-greeting">
          <h1>
            {greeting}, {user?.name || "Analyst"} 📊
          </h1>
          <p className="role-subtitle">
            Financial overview & cost analytics
          </p>
        </div>
        <div className="role-badge finance-badge">
          <span className="role-badge-icon">💰</span>
          <span>Financial Analyst</span>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="role-cards-grid">
        <div className="glass-card role-stat-card">
          <div className="role-stat-icon" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
            ⛽
          </div>
          <div className="role-stat-info">
            <span className="role-stat-value">₹{formatNumber(stats?.totalFuelCost)}</span>
            <span className="role-stat-label">Total Fuel Cost</span>
          </div>
        </div>

        <div className="glass-card role-stat-card">
          <div className="role-stat-icon" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
            💸
          </div>
          <div className="role-stat-info">
            <span className="role-stat-value">₹{formatNumber(stats?.totalExpenses)}</span>
            <span className="role-stat-label">Other Expenses</span>
          </div>
        </div>

        <div className="glass-card role-stat-card">
          <div className="role-stat-icon" style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6" }}>
            📈
          </div>
          <div className="role-stat-info">
            <span className="role-stat-value">₹{formatNumber(stats?.totalRevenue)}</span>
            <span className="role-stat-label">Total Revenue</span>
          </div>
        </div>

        <div className="glass-card role-stat-card" style={{ borderLeft: `3px solid ${profitColor}` }}>
          <div
            className="role-stat-icon"
            style={{
              background: (stats?.netProfit ?? 0) >= 0 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
              color: profitColor,
            }}
          >
            {(stats?.netProfit ?? 0) >= 0 ? "📈" : "📉"}
          </div>
          <div className="role-stat-info">
            <span className="role-stat-value" style={{ color: profitColor }}>
              ₹{formatNumber(stats?.netProfit)}
            </span>
            <span className="role-stat-label">Net Profit</span>
          </div>
        </div>
      </div>

      {/* Operational Costs + Efficiency */}
      <div className="role-cards-grid role-cards-grid-3">
        <div className="glass-card role-stat-card">
          <div className="role-stat-icon" style={{ background: "rgba(99,102,241,0.15)", color: "#6366f1" }}>
            🔧
          </div>
          <div className="role-stat-info">
            <span className="role-stat-value">₹{formatNumber(stats?.totalOperatingCost)}</span>
            <span className="role-stat-label">Total Operating Cost</span>
          </div>
        </div>

        <div className="glass-card role-stat-card">
          <div className="role-stat-icon" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
            ⚡
          </div>
          <div className="role-stat-info">
            <span className="role-stat-value">{stats?.avgFuelEfficiency ?? 0} km/L</span>
            <span className="role-stat-label">Avg Fuel Efficiency</span>
          </div>
        </div>

        <div className="glass-card role-stat-card">
          <div className="role-stat-icon" style={{
            background: (stats?.fuelAnomalies ?? 0) > 0 ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
            color: (stats?.fuelAnomalies ?? 0) > 0 ? "#ef4444" : "#10b981"
          }}>
            🚨
          </div>
          <div className="role-stat-info">
            <span className="role-stat-value">{stats?.fuelAnomalies ?? 0}</span>
            <span className="role-stat-label">Fuel Anomalies</span>
          </div>
        </div>
      </div>

      {/* Utilization Chart + Ring */}
      <div className="dashboard-content-grid">
        <div className="dashboard-charts">
          <UtilizationChart />
        </div>
        <div className="dashboard-sidebar-content">
          <KPISection stats={stats} />
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

function formatNumber(num) {
  if (num == null) return "0";
  return num.toLocaleString("en-IN");
}
