import Vehicle from "../../modules/vehicles/Vehicle.js";
import Driver from "../../modules/drivers/Driver.js";
import Trip from "../../modules/trips/Trip.js";
import { FuelLog, Expense } from "../../modules/fuelExpense/FuelExpense.js";
import ActivityLog from "../../shared/models/ActivityLog.js";

/**
 * Get dashboard statistics for Admin.
 * Full operational overview: vehicles, drivers, trips, utilization.
 */
const getFleetManagerStats = async () => {
  const [vehicles, drivers, trips, recentLogs] = await Promise.all([
    Vehicle.find({}),
    Driver.find({}),
    Trip.find({}),
    ActivityLog.find({}).sort({ timestamp: -1 }).limit(15),
  ]);

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter((v) => v.status === "On Trip").length;
  const availableVehicles = vehicles.filter((v) => v.status === "Available").length;
  const vehiclesInMaintenance = vehicles.filter((v) => v.status === "In Shop").length;

  const totalDrivers = drivers.length;
  const driversOnDuty = drivers.filter((d) => d.status === "On Trip").length;
  const availableDrivers = drivers.filter((d) => d.status === "Available").length;
  const suspendedDrivers = drivers.filter((d) => d.status === "Suspended").length;

  const activeTrips = trips.filter((t) => t.status === "Dispatched").length;
  const pendingTrips = trips.filter((t) => t.status === "Draft").length;
  const completedTrips = trips.filter((t) => t.status === "Completed").length;

  const fleetUtilization = totalVehicles > 0
    ? Math.round((activeVehicles / totalVehicles) * 100 * 10) / 10
    : 0;

  return {
    totalVehicles,
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    totalDrivers,
    driversOnDuty,
    availableDrivers,
    suspendedDrivers,
    activeTrips,
    pendingTrips,
    completedTrips,
    fleetUtilization,
    recentActivity: recentLogs,
  };
};

/**
 * Get dashboard statistics for Driver.
 * Shows only trip-related info relevant to the driver.
 */
const getDriverStats = async (userId) => {
  // Get all trips (drivers don't have userId linkage in Trip model,
  // so we show aggregate trip stats relevant to a driver's view)
  const trips = await Trip.find({}).populate("vehicleId", "name regNumber").populate("driverId", "name");

  const activeTrips = trips.filter((t) => t.status === "Dispatched").length;
  const completedTrips = trips.filter((t) => t.status === "Completed").length;
  const pendingTrips = trips.filter((t) => t.status === "Draft").length;
  const cancelledTrips = trips.filter((t) => t.status === "Cancelled").length;
  const totalTrips = trips.length;

  // Calculate total distance and fuel from completed trips
  const completed = trips.filter((t) => t.status === "Completed");
  const totalDistance = completed.reduce((sum, t) => sum + (t.actualDistance || 0), 0);
  const totalFuel = completed.reduce((sum, t) => sum + (t.fuelConsumed || 0), 0);

  return {
    activeTrips,
    completedTrips,
    pendingTrips,
    cancelledTrips,
    totalTrips,
    totalDistance: Math.round(totalDistance),
    totalFuel: Math.round(totalFuel * 10) / 10,
  };
};

/**
 * Get dashboard statistics for Safety Officer.
 * Compliance risks, driver safety, and vehicle status.
 */
const getSafetyOfficerStats = async () => {
  const [drivers, vehicles, recentLogs] = await Promise.all([
    Driver.find({}),
    Vehicle.find({}),
    ActivityLog.find({
      entityType: { $in: ["Driver", "Vehicle", "Maintenance"] },
    })
      .sort({ timestamp: -1 })
      .limit(15),
  ]);

  const totalDrivers = drivers.length;
  const suspendedDrivers = drivers.filter((d) => d.status === "Suspended").length;

  // Drivers with licenses expiring within 30 days
  const now = new Date();
  const expiringLicenses = drivers.filter((d) => {
    const expiry = new Date(d.licenseExpiryDate);
    const daysToExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return daysToExpiry <= 30 && daysToExpiry > 0;
  }).length;

  const expiredLicenses = drivers.filter((d) => {
    return new Date(d.licenseExpiryDate) < now;
  }).length;

  // Average safety score
  const avgSafetyScore = totalDrivers > 0
    ? Math.round(drivers.reduce((sum, d) => sum + d.safetyScore, 0) / totalDrivers)
    : 0;

  // Low safety score drivers (below 70)
  const lowSafetyScoreDrivers = drivers.filter((d) => d.safetyScore < 70).length;

  // Total compliance risks = suspended + expiring + expired + low safety
  const complianceRisks = suspendedDrivers + expiringLicenses + expiredLicenses + lowSafetyScoreDrivers;

  // Vehicle status
  const vehiclesInMaintenance = vehicles.filter((v) => v.status === "In Shop").length;
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter((v) => v.status === "On Trip").length;
  const availableVehicles = vehicles.filter((v) => v.status === "Available").length;

  return {
    totalDrivers,
    suspendedDrivers,
    expiringLicenses,
    expiredLicenses,
    avgSafetyScore,
    lowSafetyScoreDrivers,
    complianceRisks,
    totalVehicles,
    vehiclesInMaintenance,
    activeVehicles,
    availableVehicles,
    recentActivity: recentLogs,
  };
};

/**
 * Get dashboard statistics for Financial Analyst.
 * Fuel costs, expenses, utilization, and ROI metrics.
 */
const getFinancialAnalystStats = async () => {
  const [fuelLogs, expenses, vehicles, trips] = await Promise.all([
    FuelLog.find({}),
    Expense.find({}),
    Vehicle.find({}),
    Trip.find({ status: "Completed" }),
  ]);

  const totalFuelCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
  const totalFuelLiters = fuelLogs.reduce((sum, log) => sum + log.liters, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalOperatingCost = totalFuelCost + totalExpenses;

  const totalRevenue = trips.reduce((sum, t) => sum + (t.revenue || 0), 0);
  const netProfit = totalRevenue - totalOperatingCost;

  // Fleet utilization
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter((v) => v.status === "On Trip").length;
  const availableVehicles = vehicles.filter((v) => v.status === "Available").length;
  const vehiclesInMaintenance = vehicles.filter((v) => v.status === "In Shop").length;
  const fleetUtilization = totalVehicles > 0
    ? Math.round((activeVehicles / totalVehicles) * 100 * 10) / 10
    : 0;

  // Average fuel efficiency
  const avgFuelEfficiency = totalFuelLiters > 0
    ? Math.round(fuelLogs.reduce((sum, log) => sum + log.distance, 0) / totalFuelLiters * 10) / 10
    : 0;

  // Flagged anomalies
  const fuelAnomalies = fuelLogs.filter((log) => log.flagged).length;

  return {
    totalFuelCost: Math.round(totalFuelCost),
    totalFuelLiters: Math.round(totalFuelLiters),
    totalExpenses: Math.round(totalExpenses),
    totalOperatingCost: Math.round(totalOperatingCost),
    totalRevenue: Math.round(totalRevenue),
    netProfit: Math.round(netProfit),
    avgFuelEfficiency,
    fuelAnomalies,
    totalVehicles,
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    fleetUtilization,
  };
};

/**
 * Get dashboard stats based on user role.
 * @param {object} user - The authenticated user
 * @returns {Promise<object>} Role-appropriate dashboard stats
 */
export const getDashboardStatsByRole = async (user) => {
  switch (user.role) {
    case "Fleet Manager":
      return getFleetManagerStats();
    case "Driver":
      return getDriverStats(user._id);
    case "Safety Officer":
      return getSafetyOfficerStats();
    case "Financial Analyst":
      return getFinancialAnalystStats();
    default:
      return getFleetManagerStats();
  }
};
