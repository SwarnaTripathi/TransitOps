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
  }
};
