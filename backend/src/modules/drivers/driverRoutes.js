import express from 'express';
import Driver from './Driver.js';
import { authGuard, requireRole } from '../../shared/middleware/auth.js';
import { setDriverStatus } from '../../shared/services/statusEngine.js';

const router = express.Router();

// GET all drivers
router.get('/', authGuard, async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });
    res.json({ success: true, data: drivers });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// GET available drivers (excludes expired license, Suspended, On Trip)
router.get('/available', authGuard, async (req, res) => {
  try {
    const currentDate = new Date();
    const availableDrivers = await Driver.find({
      status: { $nin: ['Suspended', 'On Trip'] },
      licenseExpiryDate: { $gt: currentDate } // Must not be expired
    }).sort({ name: 1 });
    res.json({ success: true, data: availableDrivers });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// POST create driver
router.post('/', authGuard, requireRole(['fleet_manager', 'safety_officer']), async (req, res) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status } = req.body;

    // Check uniqueness of licenseNumber
    const existingDriver = await Driver.findOne({ licenseNumber: licenseNumber.trim() });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        error: { code: 'DUPLICATE_LICENSE_NUMBER', message: `License number '${licenseNumber}' already exists.` }
      });
    }

    const driver = new Driver({
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore: safetyScore !== undefined ? safetyScore : 100,
      status: status || 'Available'
    });

    await driver.save();
    res.status(201).json({ success: true, data: driver });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: error.message }
    });
  }
});

// PATCH update driver
router.patch('/:id', authGuard, requireRole(['fleet_manager', 'safety_officer']), async (req, res) => {
  try {
    const { licenseNumber, status, ...otherFields } = req.body;
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Driver not found' }
      });
    }

    // Check duplicate licenseNumber if it changes
    if (licenseNumber && licenseNumber !== driver.licenseNumber) {
      const existingDriver = await Driver.findOne({ licenseNumber: licenseNumber.trim() });
      if (existingDriver) {
        return res.status(400).json({
          success: false,
          error: { code: 'DUPLICATE_LICENSE_NUMBER', message: `License number '${licenseNumber}' already exists.` }
        });
      }
      driver.licenseNumber = licenseNumber;
    }

    // Apply other updates
    Object.assign(driver, otherFields);

    // If status changes, use setDriverStatus to log it correctly
    if (status && status !== driver.status) {
      await setDriverStatus(driver._id, status, { actorId: req.user._id, actorName: req.user.name });
    } else {
      await driver.save();
    }

    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message }
    });
  }
});

// DELETE driver
router.delete('/:id', authGuard, requireRole(['fleet_manager']), async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Driver not found' }
      });
    }
    res.json({ success: true, data: { message: 'Driver deleted successfully' } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

export default router;
