import React, { useState, useEffect } from 'react';
import VehiclesPage from './modules/vehicles/VehiclesPage';
import DriversPage from './modules/drivers/DriversPage';
import DashboardView from './shared/components/DashboardView';
import TripsPage from './modules/trips/TripsPage';
import MaintenancePage from './modules/maintenance/MaintenancePage';
import FuelExpensePage from './modules/fuelExpense/FuelExpensePage';
import ReportsPage from './modules/reports/ReportsPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  
  // Manage role and username state for live role switching / testing
  const [role, setRole] = useState(localStorage.getItem('transitops_role') || 'fleet_manager');
  const [username, setUsername] = useState(localStorage.getItem('transitops_username') || 'Demo Fleet Manager');

  useEffect(() => {
    localStorage.setItem('transitops_role', role);
    localStorage.setItem('transitops_username', username);
  }, [role, username]);

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    if (selectedRole === 'fleet_manager') {
      setUsername('Demo Fleet Manager');
    } else if (selectedRole === 'safety_officer') {
      setUsername('Demo Safety Officer');
    } else {
      setUsername('General Staff');
    }
    showToast(`Role switched to: ${selectedRole.replace('_', ' ')}`);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">T</div>
          <span>TransitOps</span>
        </div>

        <nav className="nav-links">
          <div 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span>📊 Dashboard</span>
          </div>

          <div 
            className={`nav-link ${activeTab === 'vehicles' ? 'active' : ''}`}
            onClick={() => setActiveTab('vehicles')}
          >
            <span>🚛 Vehicles Registry</span>
          </div>

          <div 
            className={`nav-link ${activeTab === 'drivers' ? 'active' : ''}`}
            onClick={() => setActiveTab('drivers')}
          >
            <span>👥 Driver Profiles</span>
          </div>

          <div 
            className={`nav-link ${activeTab === 'trips' ? 'active' : ''}`}
            onClick={() => setActiveTab('trips')}
          >
            <span>📋 Trip Dispatch</span>
          </div>

          <div 
            className={`nav-link ${activeTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => setActiveTab('maintenance')}
          >
            <span>🔧 Maintenance</span>
          </div>

          <div 
            className={`nav-link ${activeTab === 'fuel' ? 'active' : ''}`}
            onClick={() => setActiveTab('fuel')}
          >
            <span>⛽ Fuel & Expenses</span>
          </div>

          <div 
            className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <span>📊 Reports</span>
          </div>
        </nav>

        {/* Role Switcher for Testing / Assessment */}
        <div className="role-switcher-card">
          <div className="role-switcher-title">Test RBAC Controls</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
            Current: <strong>{username}</strong>
          </p>
          <select 
            className="role-select" 
            value={role} 
            onChange={handleRoleChange}
          >
            <option value="fleet_manager">Fleet Manager</option>
            <option value="safety_officer">Safety Officer</option>
            <option value="driver">Driver</option>
          </select>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardView onShowToast={showToast} activeTab={activeTab} />
        )}
        
        {activeTab === 'vehicles' && (
          <VehiclesPage onShowToast={showToast} userRole={role} />
        )}
        
        {activeTab === 'drivers' && (
          <DriversPage onShowToast={showToast} userRole={role} />
        )}

        {activeTab === 'trips' && (
          <TripsPage onShowToast={showToast} userRole={role} />
        )}

        {activeTab === 'maintenance' && (
          <MaintenancePage onShowToast={showToast} userRole={role} />
        )}

        {activeTab === 'fuel' && (
          <FuelExpensePage onShowToast={showToast} userRole={role} />
        )}

        {activeTab === 'reports' && (
          <ReportsPage onShowToast={showToast} userRole={role} />
        )}
      </main>

      {/* Toast Alert */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : ''}`}>
          <span>{toast.type === 'error' ? '❌' : '✨'}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
