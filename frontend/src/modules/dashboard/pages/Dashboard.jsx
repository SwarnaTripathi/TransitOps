import { useState, useEffect } from "react";
import DashboardCards from "../components/DashboardCards.jsx";
import KPISection from "../components/KPISection.jsx";
import DashboardFilters from "../components/DashboardFilters.jsx";
import ActivityFeed from "../components/ActivityFeed.jsx";
import VehicleChart from "../components/VehicleChart.jsx";
import TripChart from "../components/TripChart.jsx";
import UtilizationChart from "../components/UtilizationChart.jsx";
import { fetchDashboardStats, fetchActivityLogs } from "../api/dashboardApi.js";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [filters, setFilters] = useState({
    period: "today",
    region: "all",
    vehicleType: "all",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const statsRes = await fetchDashboardStats();
        if (statsRes.success) {
          setStats(statsRes.data);
        }
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    

    const loadActivities = async () => {
      try {
        setActivityLoading(true);
        const logsRes = await fetchActivityLogs(15);
        if (logsRes.success) {
          setActivities(logsRes.data);
        }
      } catch (error) {
        console.error("Failed to load activity logs:", error);
      } finally {
        setActivityLoading(false);
      }
    };

    loadData();
    loadActivities();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <span className="spinner spinner-lg" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>Dashboard</h1>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem" }}>
            Fleet operations overview and key metrics
          </p>
        </div>
      </div>

      {/* Filters */}
      <DashboardFilters filters={filters} onChange={setFilters} />

      {/* KPI Cards */}
      <DashboardCards stats={stats} />

      {/* Charts + Utilization Ring + Activity Feed */}
      <div className="dashboard-content-grid">
        <div className="dashboard-charts">
          <VehicleChart />
          <TripChart />
          <UtilizationChart />
        </div>

        <div className="dashboard-sidebar-content">
          <KPISection stats={stats} />
          <ActivityFeed activities={activities} loading={activityLoading} />
        </div>
      </div>
    </div>
  );
}
