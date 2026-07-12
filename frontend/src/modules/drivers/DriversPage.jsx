import React, { useState, useEffect } from 'react';
import { api } from '../../shared/api/api';
import WatchlistPanel from './WatchlistPanel';

export default function DriversPage({ onShowToast, userRole }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editDriver, setEditDriver] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [safetyScore, setSafetyScore] = useState('100');
  const [status, setStatus] = useState('Available');

  const isManagerOrSafety = userRole === 'fleet_manager' || userRole === 'safety_officer';
  const isFleetManager = userRole === 'fleet_manager';

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await api.getDrivers();
      if (res.success) {
        setDrivers(res.data);
      }
    } catch (error) {
      onShowToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [userRole]);

  const openAddModal = () => {
    setEditDriver(null);
    setName('');
    setLicenseNumber('');
    setLicenseCategory('');
    setLicenseExpiryDate('');
    setContactNumber('');
    setSafetyScore('100');
    setStatus('Available');
    setShowModal(true);
  };

  const openEditModal = (driver) => {
    setEditDriver(driver);
    setName(driver.name);
    setLicenseNumber(driver.licenseNumber);
    setLicenseCategory(driver.licenseCategory);
    
    // Format date string to YYYY-MM-DD for standard date input field
    const dateObj = new Date(driver.licenseExpiryDate);
    const dateString = dateObj.toISOString().split('T')[0];
    setLicenseExpiryDate(dateString);
    
    setContactNumber(driver.contactNumber);
    setSafetyScore(driver.safetyScore.toString());
    setStatus(driver.status);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber) {
      onShowToast('Please fill out all required fields', 'error');
      return;
    }

    const driverData = {
      name,
      licenseNumber: licenseNumber.toUpperCase(),
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore: Number(safetyScore),
      status
    };

    try {
      if (editDriver) {
        const res = await api.updateDriver(editDriver._id, driverData);
        if (res.success) {
          onShowToast('Driver profile updated successfully!');
          setShowModal(false);
          fetchDrivers();
        }
      } else {
        const res = await api.createDriver(driverData);
        if (res.success) {
          onShowToast('Driver registered successfully!');
          setShowModal(false);
          fetchDrivers();
        }
      }
    } catch (error) {
      onShowToast(error.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this driver registry?')) return;

    try {
      const res = await api.deleteDriver(id);
      if (res.success) {
        onShowToast('Driver registry deleted successfully!');
        fetchDrivers();
      }
    } catch (error) {
      onShowToast(error.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available': return <span className="badge badge-available">Available</span>;
      case 'On Trip': return <span className="badge badge-ontrip">On Trip</span>;
      case 'Off Duty': return <span className="badge badge-offduty">Off Duty</span>;
      case 'Suspended': return <span className="badge badge-suspended">Suspended</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const getLicenseBadge = (expiryDateStr) => {
    const today = new Date();
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formattedDate = expiry.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });

    if (diffDays < 0) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span>{formattedDate}</span>
          <span className="badge badge-danger-pulse" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
            ⚠ Expired ({Math.abs(diffDays)}d ago)
          </span>
        </div>
      );
    } else if (diffDays <= 30) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span>{formattedDate}</span>
          <span className="badge badge-warning-pulse" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
            ⚠ Expires soon ({diffDays}d)
          </span>
        </div>
      );
    } else if (diffDays <= 90) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span>{formattedDate}</span>
          <span className="badge badge-warning-pulse" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', animation: 'none' }}>
            Warning ({diffDays}d)
          </span>
        </div>
      );
    }

    return <span>{formattedDate}</span>;
  };

  const getSafetyScoreColor = (score) => {
    if (score >= 90) return 'var(--color-success)';
    if (score >= 70) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  // Filters
  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || 
                          d.licenseNumber.toLowerCase().includes(search.toLowerCase()) ||
                          d.contactNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? d.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Driver Management</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Register drivers, update statuses, track license compliance and safety scores.</p>
        </div>
        {isManagerOrSafety && (
          <button className="btn btn-primary" onClick={openAddModal}>
            <span>+ Register Driver</span>
          </button>
        )}
      </div>

      <div className="split-layout">
        <div>
          <div className="controls-bar">
            <input 
              type="text" 
              placeholder="Search by name, license, contact..." 
              className="form-input search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            
            <select 
              className="form-select" 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="Off Duty">Off Duty</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {loading ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ color: 'var(--text-secondary)' }}>Loading driver data...</div>
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No drivers found</h3>
              <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Driver Name</th>
                    <th>License Number</th>
                    <th>Category</th>
                    <th>License Expiry</th>
                    <th>Contact</th>
                    <th>Safety Score</th>
                    <th>Status</th>
                    {isManagerOrSafety && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((driver) => (
                    <tr key={driver._id}>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{driver.name}</td>
                      <td>{driver.licenseNumber}</td>
                      <td>{driver.licenseCategory}</td>
                      <td>{getLicenseBadge(driver.licenseExpiryDate)}</td>
                      <td>{driver.contactNumber}</td>
                      <td style={{ fontWeight: '700', color: getSafetyScoreColor(driver.safetyScore) }}>
                        {driver.safetyScore}/100
                      </td>
                      <td>{getStatusBadge(driver.status)}</td>
                      {isManagerOrSafety && (
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => openEditModal(driver)}
                            >
                              Edit
                            </button>
                            {isFleetManager && (
                              <button 
                                className="btn btn-danger btn-sm" 
                                onClick={() => handleDelete(driver._id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Watchlist Panel */}
        <div>
          <WatchlistPanel drivers={drivers} />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editDriver ? 'Edit Driver Details' : 'Register New Driver'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>License Number *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. DL-991823"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  disabled={editDriver !== null} // Should not easily modify identifier
                  required
                />
              </div>

              <div className="form-group">
                <label>License Category *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Class A CDL"
                  value={licenseCategory}
                  onChange={(e) => setLicenseCategory(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>License Expiry Date *</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={licenseExpiryDate}
                  onChange={(e) => setLicenseExpiryDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Number *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. +1-555-0192"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Safety Score (0-100)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  min="0"
                  max="100"
                  placeholder="e.g. 95"
                  value={safetyScore}
                  onChange={(e) => setSafetyScore(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Operational Status</label>
                <select 
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editDriver ? 'Save Changes' : 'Register Operator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
