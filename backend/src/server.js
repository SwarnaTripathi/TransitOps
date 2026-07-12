import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import vehicleRoutes from './modules/vehicles/vehicleRoutes.js';
import driverRoutes from './modules/drivers/driverRoutes.js';
import activityRoutes from './shared/routes/activityRoutes.js';
import maintenanceRoutes from './modules/maintenance/maintenanceRoutes.js';
import fuelExpenseRoutes from './modules/fuelExpense/fuelExpenseRoutes.js';
import reportRoutes from './modules/reports/reportRoutes.js';

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
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/activity-logs', activityRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fuel', fuelExpenseRoutes);
app.use('/api/reports', reportRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'TransitOps Backend API running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: err.message || 'An unexpected error occurred'
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
