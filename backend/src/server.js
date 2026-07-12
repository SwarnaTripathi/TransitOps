import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Database
dotenv.config();
connectDB();

const app = express();

// ===========================
// Middleware
// ===========================

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-user-role",
      "x-user-name",
    ],
  })
);

app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ===========================
// Routes
// ===========================

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/auth/user.routes.js";

import vehicleRoutes from "./modules/vehicles/vehicleRoutes.js";
import driverRoutes from "./modules/drivers/driverRoutes.js";
import tripRoutes from "./modules/trips/tripRoutes.js";

import maintenanceRoutes from "./modules/maintenance/maintenanceRoutes.js";
import fuelExpenseRoutes from "./modules/fuelExpense/fuelExpenseRoutes.js";
import reportRoutes from "./modules/reports/reportRoutes.js";

import activityRoutes from "./shared/routes/activityRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);

app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/fuel", fuelExpenseRoutes);
app.use("/api/reports", reportRoutes);

app.use("/api/activity-logs", activityRoutes);

// ===========================
// Dashboard API (Temporary)
// ===========================

app.get("/api/dashboard/stats", (req, res) => {
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

// ===========================
// Root Route
// ===========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TransitOps Backend API Running 🚀",
  });
});

// ===========================
// 404 Handler
// ===========================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// ===========================
// Global Error Handler
// ===========================

import { errorHandler } from "./shared/middleware/errorHandler.js";

app.use(errorHandler);

// ===========================
// Server
// ===========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});