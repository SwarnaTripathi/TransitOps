import express from 'express';
import Vehicle from './Vehicle.js';
import { authGuard, requireRole } from '../../shared/middleware/auth.js';
import { setVehicleStatus } from '../../shared/services/statusEngine.js';

const router = express.Router();

// GET all vehicles
router.get('/', authGuard, async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// GET available vehicles (excludes Retired / In Shop)
router.get('/available', authGuard, async (req, res) => {
  try {
    const availableVehicles = await Vehicle.find({
      status: { $nin: ['Retired', 'In Shop'] }
    }).sort({ name: 1 });
    res.json({ success: true, data: availableVehicles });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// POST create vehicle
router.post('/', authGuard, requireRole(['fleet_manager']), async (req, res) => {
  try {
    const { regNumber, name, type, maxLoadCapacity, odometer, acquisitionCost, status, region } = req.body;

    // Check uniqueness of regNumber
    const existingVehicle = await Vehicle.findOne({ regNumber: regNumber.trim() });
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        error: { code: 'DUPLICATE_REG_NUMBER', message: `Registration number '${regNumber}' already exists.` }
      });
    }

    const vehicle = new Vehicle({
      regNumber,
      name,
      type,
      maxLoadCapacity,
      odometer: odometer || 0,
      acquisitionCost,
      status: status || 'Available',
      region
    });

    await vehicle.save();
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: error.message }
    });
  }
});

// PATCH update vehicle
router.patch('/:id', authGuard, requireRole(['fleet_manager']), async (req, res) => {
  try {
    const { regNumber, status, ...otherFields } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Vehicle not found' }
      });
    }

    // Check duplicate regNumber if it changes
    if (regNumber && regNumber !== vehicle.regNumber) {
      const existingVehicle = await Vehicle.findOne({ regNumber: regNumber.trim() });
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          error: { code: 'DUPLICATE_REG_NUMBER', message: `Registration number '${regNumber}' already exists.` }
        });
      }
      vehicle.regNumber = regNumber;
    }

    // Apply other updates
    Object.assign(vehicle, otherFields);

    // If status changes, use setVehicleStatus to log it correctly
    if (status && status !== vehicle.status) {
      await setVehicleStatus(vehicle._id, status, { actorId: req.user._id, actorName: req.user.name });
    } else {
      await vehicle.save();
    }

    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message }
    });
  }
});

// DELETE vehicle
router.delete('/:id', authGuard, requireRole(['fleet_manager']), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Vehicle not found' }
      });
    }
    res.json({ success: true, data: { message: 'Vehicle deleted successfully' } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

export default router;
