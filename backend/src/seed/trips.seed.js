import Trip from '../modules/trips/Trip.js';

/**
 * Seed trips with realistic transit operational lifecycle data.
 * @param {Array} vehicles - Created vehicle documents
 * @param {Array} drivers - Created driver documents
 * @returns {Promise<number>} Number of trips created
 */
export const seedTrips = async (vehicles, drivers) => {
  const onTripVehicles = vehicles.filter(v => v.status === 'On Trip');
  const onTripDrivers = drivers.filter(d => d.status === 'On Trip');
  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = drivers.filter(d => d.status === 'Available');

  const today = new Date();
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const trips = [];

  // 1. Seed Dispatched Trips (for resources that are On Trip)
  for (let i = 0; i < Math.min(onTripVehicles.length, onTripDrivers.length); i++) {
    trips.push({
      source: 'Terminal ' + String.fromCharCode(65 + i),
      destination: 'Terminal ' + String.fromCharCode(66 + i),
      vehicleId: onTripVehicles[i]._id,
      driverId: onTripDrivers[i]._id,
      cargoWeight: Math.round(onTripVehicles[i].maxLoadCapacity * 0.8),
      plannedDistance: 120 + i * 30,
      status: 'Dispatched',
      dispatchedAt: addDays(today, -1)
    });
  }

  // 2. Seed Completed Trip
  if (availableVehicles[0] && availableDrivers[0]) {
    trips.push({
      source: 'Depot A',
      destination: 'Warehouse South',
      vehicleId: availableVehicles[0]._id,
      driverId: availableDrivers[0]._id,
      cargoWeight: Math.round(availableVehicles[0].maxLoadCapacity * 0.5),
      plannedDistance: 150,
      actualDistance: 155,
      fuelConsumed: 12.5,
      revenue: 450,
      status: 'Completed',
      dispatchedAt: addDays(today, -3),
      completedAt: addDays(today, -3)
    });
  }

  // 3. Seed Draft Trip
  if (availableVehicles[1] && availableDrivers[1]) {
    trips.push({
      source: 'Depot A',
      destination: 'Port East',
      vehicleId: availableVehicles[1]._id,
      driverId: availableDrivers[1]._id,
      cargoWeight: Math.round(availableVehicles[1].maxLoadCapacity * 0.3),
      plannedDistance: 80,
      status: 'Draft'
    });
  }

  const createdTrips = await Trip.insertMany(trips);
  return createdTrips.length;
};
