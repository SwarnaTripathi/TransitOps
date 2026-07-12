const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get auth headers with current role and name
const getHeaders = () => {
  const role = localStorage.getItem('transitops_role') || 'fleet_manager';
  const name = localStorage.getItem('transitops_username') || 'Demo User';
  return {
    'Content-Type': 'application/json',
    'x-user-role': role,
    'x-user-name': name
  };
};

const handleResponse = async (response) => {
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error?.message || 'Something went wrong');
  }
  return json;
};

export const api = {
  // Vehicles
  getVehicles: async () => {
    const res = await fetch(`${API_BASE_URL}/vehicles`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getAvailableVehicles: async () => {
    const res = await fetch(`${API_BASE_URL}/vehicles/available`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  createVehicle: async (vehicleData) => {
    const res = await fetch(`${API_BASE_URL}/vehicles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(vehicleData)
    });
    return handleResponse(res);
  },

  updateVehicle: async (id, vehicleData) => {
    const res = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(vehicleData)
    });
    return handleResponse(res);
  },

  deleteVehicle: async (id) => {
    const res = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Drivers
  getDrivers: async () => {
    const res = await fetch(`${API_BASE_URL}/drivers`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getAvailableDrivers: async () => {
    const res = await fetch(`${API_BASE_URL}/drivers/available`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  createDriver: async (driverData) => {
    const res = await fetch(`${API_BASE_URL}/drivers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(driverData)
    });
    return handleResponse(res);
  },

  updateDriver: async (id, driverData) => {
    const res = await fetch(`${API_BASE_URL}/drivers/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(driverData)
    });
    return handleResponse(res);
  },

  deleteDriver: async (id) => {
    const res = await fetch(`${API_BASE_URL}/drivers/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Activity Logs
  getActivityLogs: async () => {
    const res = await fetch(`${API_BASE_URL}/activity-logs`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Trips
  getTrips: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.vehicleId) params.append('vehicleId', filters.vehicleId);
    if (filters.driverId) params.append('driverId', filters.driverId);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/trips${queryString}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getTripById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/trips/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  createTrip: async (tripData) => {
    const res = await fetch(`${API_BASE_URL}/trips`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(tripData)
    });
    return handleResponse(res);
  },

  dispatchTrip: async (id) => {
    const res = await fetch(`${API_BASE_URL}/trips/${id}/dispatch`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  completeTrip: async (id, completeData) => {
    const res = await fetch(`${API_BASE_URL}/trips/${id}/complete`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(completeData)
    });
    return handleResponse(res);
  },

  cancelTrip: async (id) => {
    const res = await fetch(`${API_BASE_URL}/trips/${id}/cancel`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Maintenance
  getMaintenanceLogs: async () => {
    const res = await fetch(`${API_BASE_URL}/maintenance`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  openMaintenance: async (data) => {
    const res = await fetch(`${API_BASE_URL}/maintenance`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  closeMaintenance: async (id) => {
    const res = await fetch(`${API_BASE_URL}/maintenance/${id}/close`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Fuel Logs
  getFuelLogs: async (params = '') => {
    const res = await fetch(`${API_BASE_URL}/fuel/fuel-logs${params ? '?' + params : ''}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  createFuelLog: async (data) => {
    const res = await fetch(`${API_BASE_URL}/fuel/fuel-logs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Expenses
  getExpenses: async () => {
    const res = await fetch(`${API_BASE_URL}/fuel/expenses`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  createExpense: async (data) => {
    const res = await fetch(`${API_BASE_URL}/fuel/expenses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Reports
  getFuelEfficiencyReport: async () => {
    const res = await fetch(`${API_BASE_URL}/reports/fuel-efficiency`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getUtilizationReport: async () => {
    const res = await fetch(`${API_BASE_URL}/reports/utilization`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getCostReport: async () => {
    const res = await fetch(`${API_BASE_URL}/reports/cost`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getRoiReport: async () => {
    const res = await fetch(`${API_BASE_URL}/reports/roi`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  exportCsv: () => {
    const role = localStorage.getItem('transitops_role') || 'fleet_manager';
    const name = localStorage.getItem('transitops_username') || 'Demo User';
    window.open(`${API_BASE_URL}/reports/export.csv?role=${role}&name=${name}`, '_blank');
  }
};
