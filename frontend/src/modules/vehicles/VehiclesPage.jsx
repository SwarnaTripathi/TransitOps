import React, { useState, useEffect } from 'react';
import { api } from '../../shared/api/api';

export default function VehiclesPage({ onShowToast, userRole }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);

  // Form states
  const [regNumber, setRegNumber] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('Van');
  const [maxLoadCapacity, setMaxLoadCapacity] = useState('');
  const [odometer, setOdometer] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [status, setStatus] = useState('Available');
  const [region, setRegion] = useState('');

  const isFleetManager = userRole === 'fleet_manager';

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.getVehicles();
      if (res.success) {
        setVehicles(res.data);
      }
    } catch (error) {
      onShowToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [userRole]); // Refetch when role changes to ensure auth header matches

  const openAddModal = () => {
    setEditVehicle(null);
    setRegNumber('');
    setName('');
    setType('Van');
    setMaxLoadCapacity('');
    setOdometer('0');
    setAcquisitionCost('');
    setStatus('Available');
    setRegion('');
    setShowModal(true);
  };

  const openEditModal = (vehicle) => {
    setEditVehicle(vehicle);
    setRegNumber(vehicle.regNumber);
    setName(vehicle.name);
    setType(vehicle.type);
    setMaxLoadCapacity(vehicle.maxLoadCapacity.toString());
    setOdometer(vehicle.odometer.toString());
    setAcquisitionCost(vehicle.acquisitionCost.toString());
    setStatus(vehicle.status);
    setRegion(vehicle.region);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!regNumber || !name || !maxLoadCapacity || !acquisitionCost || !region) {
      onShowToast('Please fill out all required fields', 'error');
      return;
    }

    const vehicleData = {
      regNumber: regNumber.toUpperCase(),
      name,
      type,
      maxLoadCapacity: Number(maxLoadCapacity),
      odometer: Number(odometer),
      acquisitionCost: Number(acquisitionCost),
      status,
      region
    };

    try {
      if (editVehicle) {
        const res = await api.updateVehicle(editVehicle._id, vehicleData);
        if (res.success) {
          onShowToast('Vehicle updated successfully!');
          setShowModal(false);
          fetchVehicles();
        }
      } else {
        const res = await api.createVehicle(vehicleData);
        if (res.success) {
          onShowToast('Vehicle added successfully!');
          setShowModal(false);
          fetchVehicles();
        }
      }
    } catch (error) {
      onShowToast(error.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const res = await api.deleteVehicle(id);
      if (res.success) {
        onShowToast('Vehicle deleted successfully!');
        fetchVehicles();
      }
    } catch (error) {
      onShowToast(error.message, 'error');
    }
  };

  // Filters
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.regNumber.toLowerCase().includes(search.toLowerCase()) || 
                          v.name.toLowerCase().includes(search.toLowerCase()) ||
                          v.region.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? v.status === statusFilter : true;
    const matchesType = typeFilter ? v.type === typeFilter : true;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available': return <span className="badge badge-available">Available</span>;
      case 'On Trip': return <span className="badge badge-ontrip">On Trip</span>;
      case 'In Shop': return <span className="badge badge-inshop">In Shop</span>;
      case 'Retired': return <span className="badge badge-retired">Retired</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Vehicle Registry</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Manage fleet assets, configurations, and lifecycle statuses.</p>
        </div>
        {isFleetManager && (
          <button className="btn btn-primary" onClick={openAddModal}>
            <span>+ Add Vehicle</span>
          </button>
        )}
      </div>

      <div className="controls-bar">
        <input 
          type="text" 
          placeholder="Search by reg number, name, region..." 
          className="form-input search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <select 
          className="form-select" 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="Van">Van</option>
          <option value="Truck">Truck</option>
          <option value="Electric Van">Electric Van</option>
        </select>

        <select 
          className="form-select" 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="In Shop">In Shop</option>
          <option value="Retired">Retired</option>
        </select>
      </div>

      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Loading registry data...</div>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No vehicles found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Reg Number</th>
                <th>Vehicle Name</th>
                <th>Type</th>
                <th>Max Load (kg)</th>
                <th>Odometer (km)</th>
                <th>Acq. Cost</th>
                <th>Status</th>
                <th>Region</th>
                {isFleetManager && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle._id}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{vehicle.regNumber}</td>
                  <td>{vehicle.name}</td>
                  <td>{vehicle.type}</td>
                  <td>{vehicle.maxLoadCapacity.toLocaleString()}</td>
                  <td>{vehicle.odometer.toLocaleString()}</td>
                  <td>${vehicle.acquisitionCost.toLocaleString()}</td>
                  <td>{getStatusBadge(vehicle.status)}</td>
                  <td>{vehicle.region}</td>
                  {isFleetManager && (
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => openEditModal(vehicle)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleDelete(vehicle._id)}
                        >
                          Delete
                        </button>
                      </div>
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
              <h3>{editVehicle ? 'Edit Vehicle Details' : 'Register New Vehicle'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Registration Number *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. VAN-005"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  disabled={editVehicle !== null} // Reg number shouldn't be altered easily after creation
                  required
                />
              </div>

              <div className="form-group">
                <label>Vehicle Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Delivery Van 05"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Vehicle Type *</label>
                <select 
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                  <option value="Electric Van">Electric Van</option>
                </select>
              </div>

              <div className="form-group">
                <label>Max Load Capacity (kg) *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 1500"
                  value={maxLoadCapacity}
                  onChange={(e) => setMaxLoadCapacity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Odometer Reading (km) *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 12000"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Acquisition Cost ($) *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 35000"
                  value={acquisitionCost}
                  onChange={(e) => setAcquisitionCost(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Region *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. North"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  required
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
                  <option value="In Shop">In Shop</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editVehicle ? 'Save Changes' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
