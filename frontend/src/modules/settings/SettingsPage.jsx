import React, { useState } from 'react';
import useAuth from '../auth/hooks/useAuth.js';

const RBAC_MATRIX = [
  { role: 'Fleet Manager',     fleet: 'full',  drivers: 'full',  trips: 'view',  fuelExp: 'view',  analytics: 'full'  },
  { role: 'Dispatcher',        fleet: 'view',  drivers: 'view',  trips: 'full',  fuelExp: 'view',  analytics: 'view'  },
  { role: 'Safety Officer',    fleet: 'view',  drivers: 'full',  trips: 'view',  fuelExp: 'view',  analytics: 'view'  },
  { role: 'Financial Analyst', fleet: 'view',  drivers: 'view',  trips: 'view',  fuelExp: 'full',  analytics: 'full'  },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Fleet Manager';

  const [depotName, setDepotName] = useState('Gandhinagar Depot GJ4');
  const [currency, setCurrency] = useState('INR');
  const [distanceUnit, setDistanceUnit] = useState('Kilometers');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const renderPermBadge = (level) => {
    if (level === 'full') return <span className="badge badge-available">✓ Full</span>;
    return <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }}>View</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>⚙️ Settings</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Depot configuration and role-based access control matrix.
          </p>
        </div>
      </div>

      {/* ===== GENERAL SETTINGS ===== */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>GENERAL</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          <div className="form-group">
            <label>DEPOT NAME</label>
            <input
              type="text"
              className="form-input"
              value={depotName}
              onChange={e => setDepotName(e.target.value)}
              disabled={!isAdmin}
            />
          </div>
          <div className="form-group">
            <label>CURRENCY</label>
            <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)} disabled={!isAdmin}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div className="form-group">
            <label>DISTANCE UNIT</label>
            <select className="form-select" value={distanceUnit} onChange={e => setDistanceUnit(e.target.value)} disabled={!isAdmin}>
              <option value="Kilometers">Kilometers</option>
              <option value="Miles">Miles</option>
            </select>
          </div>
        </div>

        {isAdmin && (
          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={handleSave}>Save changes</button>
            {saved && <span style={{ color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 500 }}>✓ Settings saved successfully</span>}
          </div>
        )}
      </div>

      {/* ===== RBAC MATRIX ===== */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>ROLE-BASED ACCESS (RBAC)</h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            4 roles configured
          </span>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ROLE</th>
                <th>FLEET</th>
                <th>DRIVERS</th>
                <th>TRIPS</th>
                <th>FUEL/EXP.</th>
                <th>ANALYTICS</th>
              </tr>
            </thead>
            <tbody>
              {RBAC_MATRIX.map(row => {
                const isCurrentRole = user?.role === row.role;
                return (
                  <tr key={row.role} style={isCurrentRole ? { background: 'rgba(99,102,241,0.08)' } : {}}>
                    <td style={{ fontWeight: 600, color: isCurrentRole ? 'var(--accent-color)' : '#fff' }}>
                      {row.role}
                      {isCurrentRole && <span style={{ fontSize: '0.65rem', marginLeft: '0.5rem', color: 'var(--accent-color)' }}>(You)</span>}
                    </td>
                    <td>{renderPermBadge(row.fleet)}</td>
                    <td>{renderPermBadge(row.drivers)}</td>
                    <td>{renderPermBadge(row.trips)}</td>
                    <td>{renderPermBadge(row.fuelExp)}</td>
                    <td>{renderPermBadge(row.analytics)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.05)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.1)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--accent-color)' }}>✓ Full</strong> — Create, edit, delete, and view all records in the module.<br />
            <strong style={{ color: 'var(--text-secondary)' }}>View</strong> — Read-only access. Cannot modify data.
          </div>
        </div>
      </div>

      {/* App info */}
      <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
        TransitOps v1.0.0 • Smart Transport Operations Platform • Built with React + Express + MongoDB
      </div>
    </div>
  );
}
