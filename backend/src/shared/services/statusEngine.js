import Vehicle from '../../modules/vehicles/Vehicle.js';
import Driver from '../../modules/drivers/Driver.js';
import ActivityLog from '../models/ActivityLog.js';

/**
 * Update a vehicle's status and log the change in ActivityLog.
 * @param {string} vehicleId 
 * @param {string} newStatus 
 * @param {object} [actorInfo] Optional actor details ({ actorId, actorName })
 * @returns {Promise<object>} Updated vehicle document
 */
export async function setVehicleStatus(vehicleId, newStatus, actorInfo = {}) {
  const allowedStatuses = ['Available', 'On Trip', 'In Shop', 'Retired'];
  if (!allowedStatuses.includes(newStatus)) {
    throw new Error(`Invalid vehicle status: ${newStatus}`);
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new Error(`Vehicle not found: ${vehicleId}`);
  }

  const oldStatus = vehicle.status;
  vehicle.status = newStatus;
  await vehicle.save();

  // Create ActivityLog entry
  await ActivityLog.create({
    actorId: actorInfo.actorId || null,
    actorName: actorInfo.actorName || 'System',
    action: `Vehicle status changed from '${oldStatus}' to '${newStatus}' for registration number: ${vehicle.regNumber}`,
    entityType: 'Vehicle',
    entityId: vehicle._id
  });

  return vehicle;
}

/**
 * Update a driver's status and log the change in ActivityLog.
 * @param {string} driverId 
 * @param {string} newStatus 
 * @param {object} [actorInfo] Optional actor details ({ actorId, actorName })
 * @returns {Promise<object>} Updated driver document
 */
export async function setDriverStatus(driverId, newStatus, actorInfo = {}) {
  const allowedStatuses = ['Available', 'On Trip', 'Off Duty', 'Suspended'];
  if (!allowedStatuses.includes(newStatus)) {
    throw new Error(`Invalid driver status: ${newStatus}`);
  }

  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw new Error(`Driver not found: ${driverId}`);
  }

  const oldStatus = driver.status;
  driver.status = newStatus;
  await driver.save();

  // Create ActivityLog entry
  await ActivityLog.create({
    actorId: actorInfo.actorId || null,
    actorName: actorInfo.actorName || 'System',
    action: `Driver status changed from '${oldStatus}' to '${newStatus}' for driver: ${driver.name}`,
    entityType: 'Driver',
    entityId: driver._id
  });

  return driver;
}
