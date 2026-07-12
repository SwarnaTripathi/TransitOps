import { ERROR_CODES } from './trip.constants.js';

/**
 * Sends a standardized error response.
 */
export function sendErrorResponse(res, statusCode, code, message) {
  return res.status(statusCode).json({
    success: false,
    error: { code, message }
  });
}

/**
 * Validates request payload for Trip creation.
 */
export function validateTripInput(body) {
  const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance } = body;

  if (!source || typeof source !== 'string' || source.trim() === '') {
    return { isValid: false, message: 'Source terminal is required and cannot be empty' };
  }
  if (!destination || typeof destination !== 'string' || destination.trim() === '') {
    return { isValid: false, message: 'Destination terminal is required and cannot be empty' };
  }
  if (!vehicleId || typeof vehicleId !== 'string' || vehicleId.trim() === '') {
    return { isValid: false, message: 'Vehicle ID is required and cannot be empty' };
  }
  if (!driverId || typeof driverId !== 'string' || driverId.trim() === '') {
    return { isValid: false, message: 'Driver ID is required and cannot be empty' };
  }
  
  const weightNum = Number(cargoWeight);
  if (cargoWeight === undefined || cargoWeight === null || isNaN(weightNum) || weightNum <= 0) {
    return { isValid: false, message: 'Cargo weight must be a positive number greater than zero' };
  }

  const distanceNum = Number(plannedDistance);
  if (plannedDistance === undefined || plannedDistance === null || isNaN(distanceNum) || distanceNum <= 0) {
    return { isValid: false, message: 'Planned distance must be a positive number greater than zero' };
  }

  return { isValid: true };
}

/**
 * Validates a vehicle's capacity and status constraints.
 */
export function validateVehicle(vehicle, cargoWeight, availabilityOnly = false) {
  if (!vehicle) {
    return { isValid: false, code: ERROR_CODES.NOT_FOUND, message: 'Vehicle not found' };
  }

  if (!availabilityOnly) {
    const weightNum = Number(cargoWeight);
    if (weightNum > vehicle.maxLoadCapacity) {
      return {
        isValid: false,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: `Cargo weight (${weightNum} kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity} kg)`
      };
    }

    if (['Retired', 'In Shop'].includes(vehicle.status)) {
      return {
        isValid: false,
        code: ERROR_CODES.VEHICLE_UNAVAILABLE,
        message: `Vehicle is currently ${vehicle.status} and cannot be assigned`
      };
    }
  } else {
    if (vehicle.status !== 'Available') {
      return {
        isValid: false,
        code: ERROR_CODES.VEHICLE_NOT_AVAILABLE,
        message: `Vehicle is not Available. Current status: ${vehicle.status}`
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates a driver's license expiration, suspension, and status.
 */
export function validateDriver(driver, availabilityOnly = false) {
  if (!driver) {
    return { isValid: false, code: ERROR_CODES.NOT_FOUND, message: 'Driver not found' };
  }

  // License expiry check (always verified during both create and dispatch)
  const currentDate = new Date();
  if (new Date(driver.licenseExpiryDate) <= currentDate) {
    return {
      isValid: false,
      code: ERROR_CODES.DRIVER_LICENSE_EXPIRED,
      message: `Driver's license expired on ${new Date(driver.licenseExpiryDate).toLocaleDateString()}`
    };
  }

  if (!availabilityOnly) {
    if (['Suspended', 'On Trip'].includes(driver.status)) {
      return {
        isValid: false,
        code: ERROR_CODES.DRIVER_UNAVAILABLE,
        message: `Driver is currently ${driver.status} and cannot be assigned`
      };
    }
  } else {
    if (driver.status !== 'Available') {
      return {
        isValid: false,
        code: ERROR_CODES.DRIVER_NOT_AVAILABLE,
        message: `Driver is not Available. Current status: ${driver.status}`
      };
    }
  }

  return { isValid: true };
}
