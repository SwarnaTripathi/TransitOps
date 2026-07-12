import Trip from './Trip.js';
import Vehicle from '../vehicles/Vehicle.js';
import Driver from '../drivers/Driver.js';
import ActivityLog from '../../shared/models/ActivityLog.js';
import { setVehicleStatus, setDriverStatus } from '../../shared/services/statusEngine.js';
import { TRIP_STATUS, ERROR_CODES } from './trip.constants.js';
import { sendErrorResponse, validateTripInput, validateVehicle, validateDriver } from './tripHelpers.js';

/**
 * GET /api/trips
 * Fetches all trips with optional filtering by status, vehicleId, or driverId.
 */
export async function getTrips(req, res) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.vehicleId) filter.vehicleId = req.query.vehicleId;
    if (req.query.driverId) filter.driverId = req.query.driverId;

    const trips = await Trip.find(filter)
      .populate('vehicleId')
      .populate('driverId')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: trips });
  } catch (error) {
    sendErrorResponse(res, 500, ERROR_CODES.SERVER_ERROR, error.message);
  }
}

/**
 * GET /api/trips/:id
 * Fetches a single trip by ID.
 */
export async function getTripById(req, res) {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicleId')
      .populate('driverId');

    if (!trip) {
      return sendErrorResponse(res, 404, ERROR_CODES.NOT_FOUND, 'Trip not found');
    }

    res.json({ success: true, data: trip });
  } catch (error) {
    sendErrorResponse(res, 500, ERROR_CODES.SERVER_ERROR, error.message);
  }
}

/**
 * POST /api/trips
 * Creates a new Draft trip.
 */
export async function createTrip(req, res) {
  try {
    // 1. Validate request payload shape & values
    const inputValidation = validateTripInput(req.body);
    if (!inputValidation.isValid) {
      return sendErrorResponse(res, 400, ERROR_CODES.VALIDATION_ERROR, inputValidation.message);
    }

    const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance } = req.body;

    // 2. Fetch vehicle and driver records
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return sendErrorResponse(res, 404, ERROR_CODES.NOT_FOUND, 'Vehicle not found');
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return sendErrorResponse(res, 404, ERROR_CODES.NOT_FOUND, 'Driver not found');
    }

    // 3. Validate vehicle rules (capacity, retired/in shop checks)
    const vehicleValidation = validateVehicle(vehicle, cargoWeight, false);
    if (!vehicleValidation.isValid) {
      return sendErrorResponse(res, 400, vehicleValidation.code, vehicleValidation.message);
    }

    // 4. Validate driver rules (expiry, suspension/on-trip checks)
    const driverValidation = validateDriver(driver, false);
    if (!driverValidation.isValid) {
      return sendErrorResponse(res, 400, driverValidation.code, driverValidation.message);
    }

    // 5. Create Draft Trip
    const trip = new Trip({
      source: source.trim(),
      destination: destination.trim(),
      vehicleId,
      driverId,
      cargoWeight: Number(cargoWeight),
      plannedDistance: Number(plannedDistance),
      status: TRIP_STATUS.DRAFT
    });

    await trip.save();

    // 6. Log Activity
    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: `Created Draft Trip to ${destination} (Planned Distance: ${plannedDistance} km)`,
      entityType: 'Trip',
      entityId: trip._id
    });

    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    sendErrorResponse(res, 400, ERROR_CODES.VALIDATION_ERROR, error.message);
  }
}

/**
 * PATCH /api/trips/:id/dispatch
 * Dispatches a Draft trip.
 */
export async function dispatchTrip(req, res) {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return sendErrorResponse(res, 404, ERROR_CODES.NOT_FOUND, 'Trip not found');
    }

    if (trip.status !== TRIP_STATUS.DRAFT) {
      return sendErrorResponse(
        res, 
        400, 
        ERROR_CODES.INVALID_STATUS, 
        `Only Draft trips can be dispatched. Current status: ${trip.status}`
      );
    }

    const vehicle = await Vehicle.findById(trip.vehicleId);
    const driver = await Driver.findById(trip.driverId);

    if (!vehicle || !driver) {
      return sendErrorResponse(res, 404, ERROR_CODES.NOT_FOUND, 'Associated vehicle or driver not found');
    }

    // Double-check availability at dispatch time
    const vehicleValidation = validateVehicle(vehicle, null, true);
    if (!vehicleValidation.isValid) {
      return sendErrorResponse(res, 400, vehicleValidation.code, vehicleValidation.message);
    }

    const driverValidation = validateDriver(driver, true);
    if (!driverValidation.isValid) {
      return sendErrorResponse(res, 400, driverValidation.code, driverValidation.message);
    }

    // Set statuses using Status Engine
    const actorInfo = { actorId: req.user._id, actorName: req.user.name };
    await setVehicleStatus(vehicle._id, 'On Trip', actorInfo);
    await setDriverStatus(driver._id, 'On Trip', actorInfo);

    // Update Trip record
    trip.status = TRIP_STATUS.DISPATCHED;
    trip.dispatchedAt = new Date();
    await trip.save();

    // Log Activity
    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: `Dispatched Trip to ${trip.destination} with vehicle ${vehicle.regNumber} and driver ${driver.name}`,
      entityType: 'Trip',
      entityId: trip._id
    });

    res.json({ success: true, data: trip });
  } catch (error) {
    sendErrorResponse(res, 400, ERROR_CODES.DISPATCH_FAILED, error.message);
  }
}

/**
 * PATCH /api/trips/:id/complete
 * Completes a Dispatched trip, saving odometer and fuel logs.
 */
export async function completeTrip(req, res) {
  try {
    const { actualDistance, fuelConsumed } = req.body;

    const actualDistNum = Number(actualDistance);
    if (actualDistance === undefined || actualDistance === null || isNaN(actualDistNum) || actualDistNum <= 0) {
      return sendErrorResponse(res, 400, ERROR_CODES.VALIDATION_ERROR, 'Actual distance must be a positive number greater than zero');
    }

    const fuelConsumedNum = Number(fuelConsumed);
    if (fuelConsumed === undefined || fuelConsumed === null || isNaN(fuelConsumedNum) || fuelConsumedNum <= 0) {
      return sendErrorResponse(res, 400, ERROR_CODES.VALIDATION_ERROR, 'Fuel consumed must be a positive number greater than zero');
    }

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return sendErrorResponse(res, 404, ERROR_CODES.NOT_FOUND, 'Trip not found');
    }

    if (trip.status !== TRIP_STATUS.DISPATCHED) {
      return sendErrorResponse(
        res, 
        400, 
        ERROR_CODES.INVALID_STATUS, 
        `Only Dispatched trips can be completed. Current status: ${trip.status}`
      );
    }

    const vehicle = await Vehicle.findById(trip.vehicleId);
    const driver = await Driver.findById(trip.driverId);

    const actorInfo = { actorId: req.user._id, actorName: req.user.name };

    // Restore vehicle and update odometer mileage
    if (vehicle) {
      await setVehicleStatus(vehicle._id, 'Available', actorInfo);
      vehicle.odometer += actualDistNum;
      await vehicle.save();
    }

    // Restore driver status
    if (driver) {
      await setDriverStatus(driver._id, 'Available', actorInfo);
    }

    // Update Trip record
    trip.status = TRIP_STATUS.COMPLETED;
    trip.actualDistance = actualDistNum;
    trip.fuelConsumed = fuelConsumedNum;
    trip.completedAt = new Date();
    await trip.save();

    // Log Activity
    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: `Completed Trip to ${trip.destination} (Distance: ${actualDistNum} km, Fuel: ${fuelConsumedNum} L)`,
      entityType: 'Trip',
      entityId: trip._id
    });

    res.json({ success: true, data: trip });
  } catch (error) {
    sendErrorResponse(res, 400, ERROR_CODES.COMPLETE_FAILED, error.message);
  }
}

/**
 * PATCH /api/trips/:id/cancel
 * Cancels a Draft or Dispatched trip.
 */
export async function cancelTrip(req, res) {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return sendErrorResponse(res, 404, ERROR_CODES.NOT_FOUND, 'Trip not found');
    }

    if ([TRIP_STATUS.COMPLETED, TRIP_STATUS.CANCELLED].includes(trip.status)) {
      return sendErrorResponse(
        res, 
        400, 
        ERROR_CODES.INVALID_STATUS, 
        `Cannot cancel a trip that is already ${trip.status}`
      );
    }

    const actorInfo = { actorId: req.user._id, actorName: req.user.name };

    // If already dispatched, we need to free both resources
    if (trip.status === TRIP_STATUS.DISPATCHED) {
      const vehicle = await Vehicle.findById(trip.vehicleId);
      const driver = await Driver.findById(trip.driverId);

      if (vehicle) {
        await setVehicleStatus(vehicle._id, 'Available', actorInfo);
      }
      if (driver) {
        await setDriverStatus(driver._id, 'Available', actorInfo);
      }
    }

    // Update Trip status to Cancelled
    trip.status = TRIP_STATUS.CANCELLED;
    await trip.save();

    // Log Activity
    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: `Cancelled Trip to ${trip.destination}`,
      entityType: 'Trip',
      entityId: trip._id
    });

    res.json({ success: true, data: trip });
  } catch (error) {
    sendErrorResponse(res, 400, ERROR_CODES.CANCEL_FAILED, error.message);
  }
}
