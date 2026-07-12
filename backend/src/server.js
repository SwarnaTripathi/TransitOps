import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/auth/user.routes.js';
import vehicleRoutes from './modules/vehicles/vehicleRoutes.js';
import driverRoutes from './modules/drivers/driverRoutes.js';
import activityRoutes from './shared/routes/activityRoutes.js';

// Middleware imports
import { errorHandler } from './shared/middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for dev/testing ease
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role', 'x-user-name']
}));
app.use(express.json());

// Logger middleware for testing
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/activity-logs', activityRoutes);

// Dashboard mock data API
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      activeVehicles: 5,
      availableVehicles: 6,
      vehiclesInMaintenance: 1,
      activeTrips: 3,
      pendingTrips: 2,
      driversOnDuty: 4,
      fleetUtilization: 72.5,
    },
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'TransitOps Backend API running' });
});

// Global Error Handler (must be after all routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
