import React, { useState, useEffect } from 'react';
import { api } from '../../shared/api/api';

export default function TripsPage({ onShowToast, userRole }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [fetchError, setFetchError] = useState(false);

  // Available lists for Trip Creation
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');

  // Complete Modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completingTripId, setCompletingTripId] = useState(null);
  const [actualDistance, setActualDistance] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');

  const isFleetManager = userRole === 'fleet_manager';

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setFetchError(false);
      const res = await api.getTrips({
        status: statusFilter,
        vehicleId: vehicleFilter,
        driverId: driverFilter
      });
      if (res.success) {
        setTrips(res.data);
      }
    } catch (error) {
      setFetchError(true);
      onShowToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterResources = async () => {
    try {
      const [vRes, dRes] = await Promise.all([
        api.getVehicles(),
        api.getDrivers()
      ]);
      if (vRes.success) setVehicles(vRes.data);
      if (dRes.success) setDrivers(dRes.data);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  useEffect(() => {
    fetchFilterResources();
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [statusFilter, vehicleFilter, driverFilter, userRole]);

  const openCreateModal = async () => {
    setSource('');
    setDestination('');
    setCargoWeight('');
    setPlannedDistance('');
    setSelectedVehicleId('');
    setSelectedDriverId('');
    setShowCreateModal(true);

    try {
      setLoadingAvailable(true);
      const [vRes, dRes] = await Promise.all([
        api.getAvailableVehicles(),
        api.getAvailableDrivers()
      ]);
      if (vRes.success) {
        // Exclude retired and in-shop vehicles
        setAvailableVehicles(vRes.data);
      }
      if (dRes.success) {
        // Exclude suspended and on-trip drivers
        setAvailableDrivers(dRes.data);
      }
    } catch (error) {
      onShowToast('Failed to load available resources: ' + error.message, 'error');
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();

    if (!source || !destination || !cargoWeight || !plannedDistance || !selectedVehicleId || !selectedDriverId) {
      onShowToast('Please fill out all fields', 'error');
      return;
    }

    // Client-side Business Rule Validation
    const vehicle = availableVehicles.find(v => v._id === selectedVehicleId);
    if (vehicle && Number(cargoWeight) > vehicle.maxLoadCapacity) {
      onShowToast(`Weight (${cargoWeight} kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity} kg)`, 'error');
      return;
    }

    const tripData = {
      source: source.trim(),
      destination: destination.trim(),
      cargoWeight: Number(cargoWeight),
      plannedDistance: Number(plannedDistance),
      vehicleId: selectedVehicleId,
      driverId: selectedDriverId
    };

    try {
      const res = await api.createTrip(tripData);
      if (res.success) {
        onShowToast('Draft trip created successfully!');
        setShowCreateModal(false);
        fetchTrips();
      }
    } catch (error) {
      onShowToast(error.message, 'error');
    }
  };

  const handleDispatchTrip = async (id) => {
    if (!window.confirm('Are you sure you want to dispatch this trip? Both vehicle and driver status will be set to On Trip.')) return;

    try {
      const res = await api.dispatchTrip(id);
      if (res.success) {
        onShowToast('Trip dispatched successfully!');
        fetchTrips();
      }
    } catch (error) {
      onShowToast(error.message, 'error');
    }
  };

  const openCompleteModal = (id) => {
    setCompletingTripId(id);
    setActualDistance('');
    setFuelConsumed('');
    setShowCompleteModal(true);
  };

  const handleCompleteTrip = async (e) => {
    e.preventDefault();

    if (!actualDistance || !fuelConsumed) {
      onShowToast('Please fill out all fields', 'error');
      return;
    }

    try {
      const res = await api.completeTrip(completingTripId, {
        actualDistance: Number(actualDistance),
        fuelConsumed: Number(fuelConsumed)
      });
      if (res.success) {
        onShowToast('Trip completed successfully!');
        setShowCompleteModal(false);
        fetchTrips();
      }
    } catch (error) {
      onShowToast(error.message, 'error');
    }
  };

  const handleCancelTrip = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this trip? This will free the vehicle and driver back to Available.')) return;

    try {
      const res = await api.cancelTrip(id);
      if (res.success) {
        onShowToast('Trip cancelled successfully.');
        fetchTrips();
      }
    } catch (error) {
      onShowToast(error.message, 'error');
    }
  };

  // Filtering
  const filteredTrips = trips.filter(trip => {
    const query = search.toLowerCase();
    const vehicleReg = trip.vehicleId?.regNumber || '';
    const vehicleName = trip.vehicleId?.name || '';
    const driverName = trip.driverId?.name || '';
    
    return (
      trip.source.toLowerCase().includes(query) ||
      trip.destination.toLowerCase().includes(query) ||
      vehicleReg.toLowerCase().includes(query) ||
      vehicleName.toLowerCase().includes(query) ||
      driverName.toLowerCase().includes(query)
    );
  });

  // Kanban Columns grouping
  const getColumns = () => {
    return {
      Draft: filteredTrips.filter(t => t.status === 'Draft'),
      Dispatched: filteredTrips.filter(t => t.status === 'Dispatched'),
      Completed: filteredTrips.filter(t => t.status === 'Completed'),
      Cancelled: filteredTrips.filter(t => t.status === 'Cancelled')
    };
  };

  const columns = getColumns();

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Draft': return 'badge-draft';
      case 'Dispatched': return 'badge-dispatched';
      case 'Completed': return 'badge-completed';
      case 'Cancelled': return 'badge-cancelled';
      default: return '';
    }
  };

  const getSummary = () => {
    const counts = { Draft: 0, Dispatched: 0, Completed: 0, Cancelled: 0 };
    trips.forEach(t => {
      if (counts[t.status] !== undefined) {
        counts[t.status]++;
      }
    });
    return counts;
  };

  const summary = getSummary();

  const hasActiveFilters = statusFilter || vehicleFilter || driverFilter || search;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Trip Dispatch & Tracking</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Plan routes, assign resources, and monitor operational lifecycles.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="view-toggle" style={{ display: 'flex', border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden' }}>
            <button 
              className={`btn`} 
              style={{ 
                borderRadius: 0, 
                padding: '0.5rem 1rem', 
                fontSize: '0.85rem',
                background: viewMode === 'kanban' ? 'var(--accent-color)' : 'transparent',
                border: 'none'
              }}
              onClick={() => setViewMode('kanban')}
            >
              📋 Kanban Board
            </button>
            <button 
              className={`btn`} 
              style={{ 
                borderRadius: 0, 
                padding: '0.5rem 1rem', 
                fontSize: '0.85rem',
                background: viewMode === 'list' ? 'var(--accent-color)' : 'transparent',
                border: 'none'
              }}
              onClick={() => setViewMode('list')}
            >
              📝 Table List
            </button>
          </div>
          {isFleetManager && (
            <button className="btn btn-primary" onClick={openCreateModal}>
              + Plan New Trip
            </button>
          )}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div className="kpi-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Draft Trips</div>
          <div className="kpi-value" style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.25rem' }}>{summary.Draft}</div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div className="kpi-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Dispatched Trips</div>
          <div className="kpi-value" style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-info)' }}>{summary.Dispatched}</div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div className="kpi-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Completed Trips</div>
          <div className="kpi-value" style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-success)' }}>{summary.Completed}</div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div className="kpi-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cancelled Trips</div>
          <div className="kpi-value" style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-danger)' }}>{summary.Cancelled}</div>
        </div>
      </div>

      {/* Filters & Search Control Panel */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: '2 1 300px' }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search trips by source or destination..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div style={{ flex: '1 1 180px' }}>
          <select
            className="form-control"
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v._id} value={v._id}>{v.name} ({v.regNumber})</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '1 1 180px' }}>
          <select
            className="form-control"
            value={driverFilter}
            onChange={(e) => setDriverFilter(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">All Drivers</option>
            {drivers.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State Banner */}
      {fetchError && (
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--color-danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚠️</span>
            <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>Failed to load trips. Please try again.</span>
          </div>
          <button className="btn" style={{ background: 'var(--color-danger)', color: 'white', padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={fetchTrips}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        viewMode === 'kanban' ? (
          <div className="kanban-board">
            {['Draft', 'Dispatched', 'Completed', 'Cancelled'].map((col) => (
              <div key={col} className="kanban-column" style={{ opacity: 0.6 }}>
                <div className="kanban-column-header">
                  <span className="kanban-column-title">{col}</span>
                  <span className="kanban-column-count">...</span>
                </div>
                <div className="trip-card-list">
                  {[1, 2].map(n => (
                    <div key={n} className="trip-card skeleton-pulse" style={{ height: '140px', background: 'rgba(255, 255, 255, 0.03)' }}>
                      <div style={{ height: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', width: '70%', marginBottom: '12px' }}></div>
                      <div style={{ height: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '4px', width: '50%', marginBottom: '8px' }}></div>
                      <div style={{ height: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '4px', width: '40%', marginBottom: '8px' }}></div>
                      <div style={{ height: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '4px', width: '60%' }}></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table" style={{ opacity: 0.6 }}>
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Cargo Weight</th>
                  <th>Planned Dist</th>
                  <th>Actual Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map(n => (
                  <tr key={n}>
                    <td><div className="skeleton-pulse" style={{ height: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', width: '120px' }}></div></td>
                    <td><div className="skeleton-pulse" style={{ height: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', width: '100px' }}></div></td>
                    <td><div className="skeleton-pulse" style={{ height: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', width: '80px' }}></div></td>
                    <td><div className="skeleton-pulse" style={{ height: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', width: '60px' }}></div></td>
                    <td><div className="skeleton-pulse" style={{ height: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', width: '60px' }}></div></td>
                    <td><div className="skeleton-pulse" style={{ height: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', width: '80px' }}></div></td>
                    <td><div className="skeleton-pulse" style={{ height: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', width: '60px' }}></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : filteredTrips.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          {hasActiveFilters ? (
            <>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
              <h4>No Match Found</h4>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0.5rem auto' }}>
                No trips match your current filters.
              </p>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '1rem' }} 
                onClick={() => {
                  setStatusFilter('');
                  setVehicleFilter('');
                  setDriverFilter('');
                  setSearch('');
                }}
              >
                Reset Filters
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚚</div>
              <h4>No Trips Found</h4>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0.5rem auto' }}>
                Get started by planning a new dispatch trip route.
              </p>
              {isFleetManager && (
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={openCreateModal}>
                  Create First Trip
                </button>
              )}
            </>
          )}
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="kanban-board">
          {Object.entries(columns).map(([colName, colTrips]) => (
            <div key={colName} className="kanban-column">
              <div className="kanban-column-header">
                <span className="kanban-column-title">
                  {colName === 'Draft' && '📁'}
                  {colName === 'Dispatched' && '⚡'}
                  {colName === 'Completed' && '✅'}
                  {colName === 'Cancelled' && '❌'}
                  {colName}
                </span>
                <span className="kanban-column-count">{colTrips.length}</span>
              </div>

              <div className="trip-card-list">
                {colTrips.map(trip => (
                  <div key={trip._id} className="trip-card">
                    <div className="trip-card-header">
                      <div className="trip-card-route">{trip.source} ➔ {trip.destination}</div>
                    </div>

                    <div className="trip-card-info">
                      <div className="trip-card-info-item">
                        <span>🚛</span>
                        <span>
                          {trip.vehicleId 
                            ? `${trip.vehicleId.name} (${trip.vehicleId.regNumber})` 
                            : 'Unknown Vehicle'}
                        </span>
                      </div>
                      <div className="trip-card-info-item">
                        <span>👥</span>
                        <span>{trip.driverId ? trip.driverId.name : 'Unknown Driver'}</span>
                      </div>
                      <div className="trip-card-info-item">
                        <span>⚖️</span>
                        <span>Cargo: {trip.cargoWeight} kg</span>
                      </div>
                      <div className="trip-card-info-item">
                        <span>📏</span>
                        <span>Dist: {trip.plannedDistance} km</span>
                      </div>

                      {trip.status === 'Dispatched' && trip.dispatchedAt && (
                        <div className="trip-card-info-item" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
                          <span>🕒</span>
                          <span>Dispatched: {new Date(trip.dispatchedAt).toLocaleTimeString()}</span>
                        </div>
                      )}

                      {trip.status === 'Completed' && (
                        <div className="trip-card-info-item" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.4rem', marginTop: '0.4rem', color: 'var(--color-success)' }}>
                          <span>🏁</span>
                          <span>Completed: {trip.actualDistance} km (Used {trip.fuelConsumed}L)</span>
                        </div>
                      )}
                    </div>

                    {isFleetManager && (
                      <div className="trip-card-actions">
                        {trip.status === 'Draft' && (
                          <>
                            <button 
                              className="trip-card-btn trip-card-btn-primary"
                              onClick={() => handleDispatchTrip(trip._id)}
                            >
                              Dispatch
                            </button>
                            <button 
                              className="trip-card-btn trip-card-btn-secondary"
                              onClick={() => handleCancelTrip(trip._id)}
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {trip.status === 'Dispatched' && (
                          <>
                            <button 
                              className="trip-card-btn trip-card-btn-success"
                              onClick={() => openCompleteModal(trip._id)}
                            >
                              Complete
                            </button>
                            <button 
                              className="trip-card-btn trip-card-btn-secondary"
                              onClick={() => handleCancelTrip(trip._id)}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Tabular Table List View */
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Cargo Weight</th>
                <th>Planned Dist</th>
                <th>Actual Details</th>
                <th>Status</th>
                {isFleetManager && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map(trip => (
                <tr key={trip._id}>
                  <td style={{ fontWeight: 600 }}>{trip.source} ➔ {trip.destination}</td>
                  <td>
                    {trip.vehicleId ? (
                      <div>
                        <div>{trip.vehicleId.name}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{trip.vehicleId.regNumber}</span>
                      </div>
                    ) : 'N/A'}
                  </td>
                  <td>{trip.driverId ? trip.driverId.name : 'N/A'}</td>
                  <td>{trip.cargoWeight} kg</td>
                  <td>{trip.plannedDistance} km</td>
                  <td>
                    {trip.status === 'Completed' ? (
                      <div>
                        <div>{trip.actualDistance} km</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{trip.fuelConsumed} L consumed</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(trip.status)}`}>
                      {trip.status}
                    </span>
                  </td>
                  {isFleetManager && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        {trip.status === 'Draft' && (
                          <>
                            <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleDispatchTrip(trip._id)}>
                              Dispatch
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }} onClick={() => handleCancelTrip(trip._id)}>
                              Cancel
                            </button>
                          </>
                        )}
                        {trip.status === 'Dispatched' && (
                          <>
                            <button className="btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: 'var(--color-success)', color: '#fff' }} onClick={() => openCompleteModal(trip._id)}>
                              Complete
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }} onClick={() => handleCancelTrip(trip._id)}>
                              Cancel
                            </button>
                          </>
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

      {/* CREATE TRIP MODAL */}
      {showCreateModal && (
        <div className="modal">
          <div className="modal-content glass-card">
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              <h3>Plan Dispatch Trip Route</h3>
              <button className="btn" style={{ background: 'transparent', border: 'none', fontSize: '1.25rem' }} onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            {loadingAvailable ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading available resources...</div>
            ) : (
              <form onSubmit={handleCreateTrip}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Source Terminal *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      value={source} 
                      onChange={(e) => setSource(e.target.value)} 
                      placeholder="e.g. Depot A"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Destination Terminal *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      value={destination} 
                      onChange={(e) => setDestination(e.target.value)} 
                      placeholder="e.g. Depot B"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Cargo Weight (kg) *</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      required 
                      min="0" 
                      value={cargoWeight} 
                      onChange={(e) => setCargoWeight(e.target.value)} 
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Planned Distance (km) *</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      required 
                      min="0" 
                      value={plannedDistance} 
                      onChange={(e) => setPlannedDistance(e.target.value)} 
                      placeholder="e.g. 120"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Assign Vehicle *</label>
                  <select 
                    className="form-control" 
                    required 
                    value={selectedVehicleId} 
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                  >
                    <option value="">-- Select Available Vehicle --</option>
                    {availableVehicles.map(vehicle => {
                      const exceeds = Number(cargoWeight) > vehicle.maxLoadCapacity;
                      return (
                        <option 
                          key={vehicle._id} 
                          value={vehicle._id}
                          disabled={exceeds}
                        >
                          {vehicle.name} ({vehicle.regNumber}) - Cap: {vehicle.maxLoadCapacity}kg {exceeds ? '[EXCEEDS WEIGHT]' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label">Assign Driver *</label>
                  <select 
                    className="form-control" 
                    required 
                    value={selectedDriverId} 
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                  >
                    <option value="">-- Select Available Driver --</option>
                    {availableDrivers.map(driver => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name} - Class {driver.licenseCategory} (Safety Score: {driver.safetyScore})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Draft Trip</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* COMPLETE TRIP MODAL */}
      {showCompleteModal && (
        <div className="modal">
          <div className="modal-content glass-card" style={{ maxWidth: '400px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              <h3>Log Complete Trip Details</h3>
              <button className="btn" style={{ background: 'transparent', border: 'none', fontSize: '1.25rem' }} onClick={() => setShowCompleteModal(false)}>×</button>
            </div>
            <form onSubmit={handleCompleteTrip}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Actual Odometer Distance (km) *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  required 
                  min="1"
                  value={actualDistance} 
                  onChange={(e) => setActualDistance(e.target.value)} 
                  placeholder="Odometer difference"
                />
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Fuel Consumed (Liters) *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  required 
                  min="1"
                  value={fuelConsumed} 
                  onChange={(e) => setFuelConsumed(e.target.value)} 
                  placeholder="Total fuel liters"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCompleteModal(false)}>Cancel</button>
                <button type="submit" className="btn" style={{ background: 'var(--color-success)', color: '#fff' }}>Log Complete</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
