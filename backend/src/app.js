const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "TransitOps Backend Running 🚀"
    });
});

// Routes
// app.use("/api/auth", require("./modules/auth/auth.routes"));
// app.use("/api/vehicles", require("./modules/vehicles/vehicle.routes"));
// app.use("/api/drivers", require("./modules/drivers/driver.routes"));
// app.use("/api/trips", require("./modules/trips/trip.routes"));
// app.use("/api/maintenance", require("./modules/maintenance/maintenance.routes"));
// app.use("/api/fuel", require("./modules/fuelExpense/fuel.routes"));
// app.use("/api/expenses", require("./modules/fuelExpense/expense.routes"));
// app.use("/api/reports", require("./modules/reports/report.routes"));

// 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not Found"
    });
});

module.exports = app;