import React, { useState, useEffect } from 'react';
import { api } from '../../shared/api/api';

export default function FuelExpensePage({ onShowToast, userRole }) {
  const [tab, setTab] = useState('fuel');
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);
  const [fVehicleId, setFVehicleId] = useState('');
  const [fLiters, setFLiters] = useState('');
  const [fCost, setFCost] = useState('');
  const [fDistance, setFDistance] = useState('');
  const [eVehicleId, setEVehicleId] = useState('');
  const [eType, setEType] = useState('toll');
  const [eAmount, setEAmount] = useState('');
  const [eNote, setENote] = useState('');
  const isManager = userRole === 'fleet_manager';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fRes, eRes, vRes, mRes] = await Promise.all([
        api.getFuelLogs(showAnomaliesOnly ? 'flagged=true' : ''),
        api.getExpenses(), api.getVehicles(), api.getMaintenanceLogs()
      ]);
      if (fRes.success) setFuelLogs(fRes.data);
      if (eRes.success) setExpenses(eRes.data);
      if (vRes.success) setVehicles(vRes.data);
      if (mRes.success) setMaintenanceLogs(mRes.data);
    } catch (err) { onShowToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [userRole, showAnomaliesOnly]);

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createFuelLog({ vehicleId: fVehicleId, liters: Number(fLiters), cost: Number(fCost), distance: Number(fDistance) });
      if (res.success) {
        onShowToast(res.data.flagged ? `⚠ Anomaly detected! ${res.data.deviationPct}% below expected` : 'Fuel log recorded', res.data.flagged ? 'error' : 'success');
        setShowFuelModal(false); fetchData();
      }
    } catch (err) { onShowToast(err.message, 'error'); }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createExpense({ vehicleId: eVehicleId, type: eType, amount: Number(eAmount), note: eNote });
      if (res.success) { onShowToast('Expense recorded'); setShowExpenseModal(false); fetchData(); }
    } catch (err) { onShowToast(err.message, 'error'); }
  };

  const flaggedCount = fuelLogs.filter(l => l.flagged).length;
  const totalFuelCost = fuelLogs.reduce((s, l) => s + l.cost, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalMaintenanceCost = maintenanceLogs.reduce((s, m) => s + (m.cost || 0), 0);
  const totalOperationalCost = totalFuelCost + totalMaintenanceCost;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>⛽ Fuel &amp; Expenses</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Track fuel consumption, detect anomalies, and log operational expenses.</p>
        </div>
        {isManager && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={() => setShowFuelModal(true)}>+ Log Fuel</button>
            <button className="btn btn-secondary" onClick={() => setShowExpenseModal(true)}>+ Add Expense</button>
          </div>
        )}
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginBottom: '2rem' }}>
        <div className="glass-card"><div className="kpi-title">Total Fuel Logs</div><div className="kpi-value">{fuelLogs.length}</div></div>
        <div className="glass-card"><div className="kpi-title">Fuel Spend</div><div className="kpi-value" style={{ color: 'var(--accent-color)' }}>₹{totalFuelCost.toLocaleString()}</div></div>
        <div className="glass-card" style={{ borderColor: flaggedCount > 0 ? 'rgba(239,68,68,0.4)' : 'var(--glass-border)' }}>
          <div className="kpi-title">🚨 Anomalies</div>
          <div className="kpi-value" style={{ color: flaggedCount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{flaggedCount}</div>
        </div>
        <div className="glass-card"><div className="kpi-title">Other Expenses</div><div className="kpi-value">₹{totalExpenses.toLocaleString()}</div></div>
        <div className="glass-card" style={{ borderLeft: '3px solid var(--color-warning)' }}>
          <div className="kpi-title">TOTAL OPERATIONAL COST</div>
          <div className="kpi-value" style={{ color: 'var(--color-warning)' }}>₹{totalOperationalCost.toLocaleString()}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Fuel + Maintenance</div>
        </div>
      </div>

      <div className="controls-bar">
        <button className={`btn ${tab === 'fuel' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('fuel')}>Fuel Logs</button>
        <button className={`btn ${tab === 'expenses' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('expenses')}>Expenses</button>
        {tab === 'fuel' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginLeft: 'auto' }}>
            <input type="checkbox" checked={showAnomaliesOnly} onChange={e => setShowAnomaliesOnly(e.target.checked)} /> Show anomalies only
          </label>
        )}
      </div>

      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}><div style={{ color: 'var(--text-secondary)' }}>Loading...</div></div>
      ) : tab === 'fuel' ? (
        fuelLogs.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}><h3 style={{ color: 'var(--text-secondary)' }}>No fuel logs yet</h3></div>
        ) : (
          <div className="table-container"><table className="custom-table"><thead><tr>
            <th>Vehicle</th><th>Liters</th><th>Cost (₹)</th><th>Distance</th><th>Efficiency</th><th>Status</th><th>Date</th>
          </tr></thead><tbody>
            {fuelLogs.map(log => (
              <tr key={log._id} style={log.flagged ? { background: 'rgba(239,68,68,0.06)' } : {}}>
                <td style={{ fontWeight: 600, color: '#fff' }}>{log.vehicleId?.regNumber || 'N/A'}</td>
                <td>{log.liters} L</td><td>₹{log.cost?.toLocaleString()}</td><td>{log.distance} km</td>
                <td>{log.actualEfficiency?.toFixed(1) || '—'} km/L</td>
                <td>{log.flagged ? <span className="badge badge-danger-pulse">⚠ {log.deviationPct}%↓</span> : <span className="badge badge-available">Normal</span>}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(log.date || log.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody></table></div>
        )
      ) : (
        expenses.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}><h3 style={{ color: 'var(--text-secondary)' }}>No expenses yet</h3></div>
        ) : (
          <div className="table-container"><table className="custom-table"><thead><tr>
            <th>Vehicle</th><th>Type</th><th>Amount (₹)</th><th>Note</th><th>Date</th>
          </tr></thead><tbody>
            {expenses.map(exp => (
              <tr key={exp._id}>
                <td style={{ fontWeight: 600, color: '#fff' }}>{exp.vehicleId || 'N/A'}</td>
                <td><span className="badge badge-ontrip">{exp.type}</span></td>
                <td>₹{exp.amount?.toLocaleString()}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{exp.note || '—'}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(exp.date || exp.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody></table></div>
        )
      )}

      {showFuelModal && (
        <div className="modal-overlay"><div className="modal-content">
          <div className="modal-header"><h3>Log Fuel Purchase</h3><button className="modal-close" onClick={() => setShowFuelModal(false)}>&times;</button></div>
          <form onSubmit={handleFuelSubmit}>
            <div className="form-group"><label>Vehicle *</label>
              <select className="form-select" value={fVehicleId} onChange={e => setFVehicleId(e.target.value)} required>
                <option value="">Select vehicle…</option>
                {vehicles.map(v => <option key={v._id} value={v._id}>{v.regNumber} — {v.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Liters *</label><input type="number" step="0.1" className="form-input" value={fLiters} onChange={e => setFLiters(e.target.value)} required /></div>
            <div className="form-group"><label>Cost ($) *</label><input type="number" step="0.01" className="form-input" value={fCost} onChange={e => setFCost(e.target.value)} required /></div>
            <div className="form-group"><label>Distance (km) *</label><input type="number" className="form-input" value={fDistance} onChange={e => setFDistance(e.target.value)} required /></div>
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowFuelModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Record</button></div>
          </form>
        </div></div>
      )}

      {showExpenseModal && (
        <div className="modal-overlay"><div className="modal-content">
          <div className="modal-header"><h3>Add Expense</h3><button className="modal-close" onClick={() => setShowExpenseModal(false)}>&times;</button></div>
          <form onSubmit={handleExpenseSubmit}>
            <div className="form-group"><label>Vehicle *</label>
              <select className="form-select" value={eVehicleId} onChange={e => setEVehicleId(e.target.value)} required>
                <option value="">Select vehicle…</option>
                {vehicles.map(v => <option key={v._id} value={v._id}>{v.regNumber} — {v.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Type *</label>
              <select className="form-select" value={eType} onChange={e => setEType(e.target.value)}><option value="toll">Toll</option><option value="other">Other</option></select>
            </div>
            <div className="form-group"><label>Amount ($) *</label><input type="number" step="0.01" className="form-input" value={eAmount} onChange={e => setEAmount(e.target.value)} required /></div>
            <div className="form-group"><label>Note</label><input type="text" className="form-input" value={eNote} onChange={e => setENote(e.target.value)} /></div>
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowExpenseModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
          </form>
        </div></div>
      )}
    </div>
  );
}
