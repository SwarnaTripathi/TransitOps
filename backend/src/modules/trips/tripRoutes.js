import express from 'express';
import { authGuard, requireRole } from '../../shared/middleware/auth.js';
import { 
  getTrips, 
  getTripById, 
  createTrip, 
  dispatchTrip, 
  completeTrip, 
  cancelTrip 
} from './tripController.js';

const router = express.Router();

// GET all trips (with optional filters: status, vehicleId, driverId)
router.get('/', authGuard, getTrips);

// GET a trip by ID
router.get('/:id', authGuard, getTripById);

// POST create trip (creates Draft trip)
router.post('/', authGuard, requireRole(['fleet_manager']), createTrip);

// PATCH dispatch trip
router.patch('/:id/dispatch', authGuard, requireRole(['fleet_manager']), dispatchTrip);

// PATCH complete trip
router.patch('/:id/complete', authGuard, requireRole(['fleet_manager']), completeTrip);

// PATCH cancel trip
router.patch('/:id/cancel', authGuard, requireRole(['fleet_manager']), cancelTrip);

export default router;
