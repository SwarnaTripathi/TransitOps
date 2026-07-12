import React, { useState, useEffect } from 'react';
import { api } from '../../shared/api/api';

export default function MaintenancePage({ onShowToast, userRole }) {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('');

  // Form state
  const [vehicleId, setVehicleId] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');

  const SERVICE_TYPES = ['Oil Change', 'Tyre Replace', 'Engine Repair', 'Brake Inspection', 'Battery Service', 'General Service'];

  const isManager = userRole === 'fleet_manager' || userRole === 'safety_officer';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, vRes] = await Promise.all([
        api.getMaintenanceLogs(),
        api.getVehicles()
      ]);
      if (mRes.success) setLogs(mRes.data);
      if (vRes.success) setVehicles(vRes.data);
    } catch (err) {
      onShowToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [userRole]);

  const handleOpen = async (e) => {
    e.preventDefault();
    if (!vehicleId || !serviceType || !cost) {
      onShowToast('Please fill all fields', 'error');
      return;
    }
    try {
      const res = await api.openMaintenance({ vehicleId, type: serviceType, description, cost: Number(cost) });
      if (res.success) {
        onShowToast('Maintenance log opened — vehicle moved to In Shop');
        setShowModal(false);
        setVehicleId(''); setServiceType(''); setDescription(''); setCost('');
        fetchData();
      }
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  const handleClose = async (id) => {
    try {
      const res = await api.closeMaintenance(id);
      if (res.success) {
        onShowToast('Maintenance closed — vehicle back to Available');
        fetchData();
      }
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  const filtered = logs.filter(l => {
    if (!filter) return true;
    return l.status === filter;
  });

  const activeLogs = logs.filter(l => l.status === 'Active');
  const closedLogs = logs.filter(l => l.status === 'Closed');

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>🔧 Maintenance</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Monitor shop visits, close records to release vehicles back to the fleet.
          </p>
        </div>
        {isManager && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Open Maintenance
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '2rem' }}>
        <div className="glass-card">
          <div className="kpi-title">Total Records</div>
          <div className="kpi-value">{logs.length}</div>
        </div>
        <div className="glass-card" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
          <div className="kpi-title">🟡 Active (In Shop)</div>
          <div className="kpi-value" style={{ color: 'var(--color-warning)' }}>{activeLogs.length}</div>
        </div>
        <div className="glass-card" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
          <div className="kpi-title">✅ Closed</div>
          <div className="kpi-value" style={{ color: 'var(--color-success)' }}>{closedLogs.length}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="controls-bar">
        <select className="form-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Loading maintenance logs...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No maintenance records found</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Service Type</th>
                <th>Notes</th>
                <th>Cost (₹)</th>
                <th>Status</th>
                <th>Date</th>
                {isManager && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log._id}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>
                    {log.vehicleId?.regNumber || 'N/A'}
                  </td>
                  <td><span className="badge badge-ontrip">{log.type || '—'}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{log.description || '—'}</td>
                  <td>₹{log.cost?.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${log.status === 'Active' ? 'badge-inshop' : 'badge-available'}`}>
                      {log.status === 'Active' ? 'In Shop' : 'Completed'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {new Date(log.openedAt || log.createdAt).toLocaleDateString()}
                  </td>
                  {isManager && (
                    <td>
                      {log.status === 'Active' && (
                        <button className="btn btn-sm" style={{ background: 'var(--color-success)', color: '#fff' }}
                          onClick={() => handleClose(log._id)}>
                          Close & Release
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Open Maintenance Record</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleOpen}>
              <div className="form-group">
                <label>Vehicle *</label>
                <select className="form-select" value={vehicleId} onChange={e => setVehicleId(e.target.value)} required>
                  <option value="">Select vehicle…</option>
                  {vehicles.filter(v => v.status !== 'Retired').map(v => (
                    <option key={v._id} value={v._id}>{v.regNumber} — {v.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Service Type *</label>
                <select className="form-select" value={serviceType} onChange={e => setServiceType(e.target.value)} required>
                  <option value="">Select service type…</option>
                  {SERVICE_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Service Notes</label>
                <input type="text" className="form-input" placeholder="e.g. Front left tyre worn out"
                  value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Cost (₹) *</label>
                <input type="number" className="form-input" placeholder="e.g. 2500"
                  value={cost} onChange={e => setCost(e.target.value)} required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
