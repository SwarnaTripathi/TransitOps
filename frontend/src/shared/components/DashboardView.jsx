import React, { useState, useEffect } from 'react';
import { api } from '../api/api';

export default function DashboardView({ onShowToast, activeTab }) {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vRes, dRes, aRes] = await Promise.all([
        api.getVehicles(),
        api.getDrivers(),
        api.getActivityLogs()
      ]);

      if (vRes.success) setVehicles(vRes.data);
      if (dRes.success) setDrivers(dRes.data);
      if (aRes.success) setActivityLogs(aRes.data);
    } catch (error) {
      onShowToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]); // Refetch when tab changes back to dashboard

  const getKPIs = () => {
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
    const inShopVehicles = vehicles.filter(v => v.status === 'In Shop').length;
    const onTripVehicles = vehicles.filter(v => v.status === 'On Trip').length;

    const totalDrivers = drivers.length;
    const availableDrivers = drivers.filter(d => d.status === 'Available').length;
    const suspendedDrivers = drivers.filter(d => d.status === 'Suspended').length;

    return {
      totalVehicles,
      availableVehicles,
      inShopVehicles,
      onTripVehicles,
      totalDrivers,
      availableDrivers,
      suspendedDrivers
    };
  };

  const kpis = getKPIs();

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Operations Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Overview of fleet statistics, operations, and compliance status.</p>
        </div>
      </div>

      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Loading dashboard statistics...</div>
        </div>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="glass-card">
              <div className="kpi-title">Total Vehicles</div>
              <div className="kpi-value">{kpis.totalVehicles}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{kpis.availableVehicles}</span> Available &bull; 
                <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}> {kpis.inShopVehicles}</span> In Shop
              </div>
            </div>

            <div className="glass-card">
              <div className="kpi-title">Fleet Utilization</div>
              <div className="kpi-value">
                {kpis.totalVehicles ? Math.round((kpis.onTripVehicles / kpis.totalVehicles) * 100) : 0}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                <span>{kpis.onTripVehicles} active vehicle trips</span>
              </div>
            </div>

            <div className="glass-card">
              <div className="kpi-title">Total Operators</div>
              <div className="kpi-value">{kpis.totalDrivers}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{kpis.availableDrivers}</span> Available &bull; 
                <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}> {kpis.suspendedDrivers}</span> Suspended
              </div>
            </div>

            <div className="glass-card" style={{ borderLeft: '3px solid var(--accent-color)' }}>
              <div className="kpi-title">Compliance Risks</div>
              <div className="kpi-value" style={{ color: kpis.suspendedDrivers > 0 ? 'var(--color-warning)' : 'inherit' }}>
                {drivers.filter(d => {
                  const expiry = new Date(d.licenseExpiryDate);
                  const daysToExpiry = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
                  return daysToExpiry <= 30 || d.status === 'Suspended';
                }).length}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                <span>Near expiry or suspended</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Live Fleet Audit Feed</h3>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              {activityLogs.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                  No activities logged yet. Perform operations (status updates) to see them here.
                </div>
              ) : (
                <div className="activity-list">
                  {activityLogs.map((log) => (
                    <div key={log._id} className="activity-item">
                      <div>
                        <strong style={{ color: 'var(--accent-color)' }}>{log.actorName}</strong> ({log.entityType}): {log.action}
                      </div>
                      <div className="activity-time">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
