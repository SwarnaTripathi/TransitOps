import express from 'express';
import Trip from './Trip.js';
import Vehicle from '../vehicles/Vehicle.js';
import Driver from '../drivers/Driver.js';
import ActivityLog from '../../shared/models/ActivityLog.js';
import { authGuard, requireRole } from '../../shared/middleware/auth.js';
import { setVehicleStatus, setDriverStatus } from '../../shared/services/statusEngine.js';

const router = express.Router();

// GET all trips
router.get('/', authGuard, async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate('vehicleId')
      .populate('driverId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: trips });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// POST create trip (creates Draft trip)
router.post('/', authGuard, requireRole(['fleet_manager']), async (req, res) => {
  try {
    const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance } = req.body;

    // Fetch vehicle and driver
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Vehicle not found' }
      });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Driver not found' }
      });
    }

    // Business Rule: Cargo weight validation
    if (cargoWeight > vehicle.maxLoadCapacity) {
      return res.status(400).json({
        success: false,
        error: { 
          code: 'VALIDATION_ERROR', 
          message: `Cargo weight (${cargoWeight} kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity} kg)` 
        }
      });
    }

    // Business Rule: Vehicle availability validation
    if (['Retired', 'In Shop'].includes(vehicle.status)) {
      return res.status(400).json({
        success: false,
        error: { 
          code: 'VEHICLE_UNAVAILABLE', 
          message: `Vehicle is currently ${vehicle.status} and cannot be assigned` 
        }
      });
    }

    // Business Rule: Driver availability and license validation
    if (['Suspended', 'On Trip'].includes(driver.status)) {
      return res.status(400).json({
        success: false,
        error: { 
          code: 'DRIVER_UNAVAILABLE', 
          message: `Driver is currently ${driver.status} and cannot be assigned` 
        }
      });
    }

    const currentDate = new Date();
    if (new Date(driver.licenseExpiryDate) <= currentDate) {
      return res.status(400).json({
        success: false,
        error: { 
          code: 'DRIVER_LICENSE_EXPIRED', 
          message: `Driver's license expired on ${new Date(driver.licenseExpiryDate).toLocaleDateString()}` 
        }
      });
    }

    // Create Draft Trip
    const trip = new Trip({
      source,
      destination,
      vehicleId,
      driverId,
      cargoWeight,
      plannedDistance,
      status: 'Draft'
    });

    await trip.save();

    // Log Activity
    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: `Created Draft Trip to ${destination} (Planned Distance: ${plannedDistance} km)`,
      entityType: 'Trip',
      entityId: trip._id
    });

    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: error.message }
    });
  }
});

// PATCH dispatch trip
router.patch('/:id/dispatch', authGuard, requireRole(['fleet_manager']), async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Trip not found' }
      });
    }

    if (trip.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: `Only Draft trips can be dispatched. Current status: ${trip.status}` }
      });
    }

    const vehicle = await Vehicle.findById(trip.vehicleId);
    const driver = await Driver.findById(trip.driverId);

    if (!vehicle || !driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Associated vehicle or driver not found' }
      });
    }

    // Double-check availability at dispatch time
    if (vehicle.status !== 'Available') {
      return res.status(400).json({
        success: false,
        error: { code: 'VEHICLE_NOT_AVAILABLE', message: `Vehicle is not Available. Current: ${vehicle.status}` }
      });
    }

    if (driver.status !== 'Available') {
      return res.status(400).json({
        success: false,
        error: { code: 'DRIVER_NOT_AVAILABLE', message: `Driver is not Available. Current: ${driver.status}` }
      });
    }

    const currentDate = new Date();
    if (new Date(driver.licenseExpiryDate) <= currentDate) {
      return res.status(400).json({
        success: false,
        error: { code: 'DRIVER_LICENSE_EXPIRED', message: "Driver's license is expired. Cannot dispatch." }
      });
    }

    // Set Vehicle and Driver status to On Trip
    const actorInfo = { actorId: req.user._id, actorName: req.user.name };
    await setVehicleStatus(vehicle._id, 'On Trip', actorInfo);
    await setDriverStatus(driver._id, 'On Trip', actorInfo);

    // Update Trip status to Dispatched
    trip.status = 'Dispatched';
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
    res.status(400).json({
      success: false,
      error: { code: 'DISPATCH_FAILED', message: error.message }
    });
  }
});

// PATCH complete trip
router.patch('/:id/complete', authGuard, requireRole(['fleet_manager']), async (req, res) => {
  try {
    const { actualDistance, fuelConsumed } = req.body;

    if (actualDistance === undefined || actualDistance <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Actual distance must be a positive number' }
      });
    }

    if (fuelConsumed === undefined || fuelConsumed <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Fuel consumed must be a positive number' }
      });
    }

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Trip not found' }
      });
    }

    if (trip.status !== 'Dispatched') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: `Only Dispatched trips can be completed. Current status: ${trip.status}` }
      });
    }

    const vehicle = await Vehicle.findById(trip.vehicleId);
    const driver = await Driver.findById(trip.driverId);

    const actorInfo = { actorId: req.user._id, actorName: req.user.name };

    // Restore vehicle status and update odometer
    if (vehicle) {
      await setVehicleStatus(vehicle._id, 'Available', actorInfo);
      vehicle.odometer += Number(actualDistance);
      await vehicle.save();
    }

    // Restore driver status
    if (driver) {
      await setDriverStatus(driver._id, 'Available', actorInfo);
    }

    // Update Trip record
    trip.status = 'Completed';
    trip.actualDistance = Number(actualDistance);
    trip.fuelConsumed = Number(fuelConsumed);
    trip.completedAt = new Date();
    await trip.save();

    // Log Activity
    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: `Completed Trip to ${trip.destination} (Distance: ${actualDistance} km, Fuel: ${fuelConsumed} L)`,
      entityType: 'Trip',
      entityId: trip._id
    });

    res.json({ success: true, data: trip });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { code: 'COMPLETE_FAILED', message: error.message }
    });
  }
});

// PATCH cancel trip
router.patch('/:id/cancel', authGuard, requireRole(['fleet_manager']), async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Trip not found' }
      });
    }

    if (['Completed', 'Cancelled'].includes(trip.status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: `Cannot cancel a trip that is already ${trip.status}` }
      });
    }

    const actorInfo = { actorId: req.user._id, actorName: req.user.name };

    // If it was already dispatched, we must free the vehicle and driver back to Available
    if (trip.status === 'Dispatched') {
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
    trip.status = 'Cancelled';
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
    res.status(400).json({
      success: false,
      error: { code: 'CANCEL_FAILED', message: error.message }
    });
  }
});

export default router;
