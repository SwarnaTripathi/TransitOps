import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vehicle from './modules/vehicles/Vehicle.js';
import Driver from './modules/drivers/Driver.js';
import ActivityLog from './shared/models/ActivityLog.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/transitops');
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await Vehicle.deleteMany({});
    await Driver.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('Cleared existing database entries.');

    // Seed Vehicles
    const vehicles = [
      { regNumber: 'VAN-001', name: 'Delivery Van 01', type: 'Van', maxLoadCapacity: 1200, odometer: 15000, acquisitionCost: 28000, status: 'Available', region: 'North' },
      { regNumber: 'VAN-002', name: 'Delivery Van 02', type: 'Van', maxLoadCapacity: 1200, odometer: 18450, acquisitionCost: 28000, status: 'On Trip', region: 'South' },
      { regNumber: 'VAN-003', name: 'Heavy Duty Van 03', type: 'Van', maxLoadCapacity: 1800, odometer: 32100, acquisitionCost: 35000, status: 'In Shop', region: 'East' },
      { regNumber: 'TRK-001', name: 'Freight Truck 01', type: 'Truck', maxLoadCapacity: 8000, odometer: 120500, acquisitionCost: 85000, status: 'Available', region: 'North' },
      { regNumber: 'TRK-002', name: 'Cargo Truck 02', type: 'Truck', maxLoadCapacity: 10000, odometer: 95400, acquisitionCost: 90000, status: 'On Trip', region: 'West' },
      { regNumber: 'TRK-003', name: 'Flatbed Truck 03', type: 'Truck', maxLoadCapacity: 12000, odometer: 140000, acquisitionCost: 110000, status: 'Retired', region: 'East' },
      { regNumber: 'EVN-001', name: 'Electric Van 01', type: 'Electric Van', maxLoadCapacity: 1000, odometer: 8200, acquisitionCost: 45000, status: 'Available', region: 'North' },
      { regNumber: 'EVN-002', name: 'Electric Van 02', type: 'Electric Van', maxLoadCapacity: 1000, odometer: 12100, acquisitionCost: 45000, status: 'Available', region: 'South' },
      { regNumber: 'TRK-004', name: 'Refrigerated Truck 04', type: 'Truck', maxLoadCapacity: 7500, odometer: 63000, acquisitionCost: 98000, status: 'Available', region: 'West' },
      { regNumber: 'VAN-004', name: 'Courier Van 04', type: 'Van', maxLoadCapacity: 800, odometer: 42000, acquisitionCost: 22000, status: 'Available', region: 'South' }
    ];

    const seededVehicles = await Vehicle.insertMany(vehicles);
    console.log(`Seeded ${seededVehicles.length} vehicles.`);

    // Seed Drivers
    // Expiries: some normal, some expired, some near expiry (e.g. 5 days, 45 days)
    const today = new Date();
    const addDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    const drivers = [
      { name: 'Alex Johnson', licenseNumber: 'DL-994821', licenseCategory: 'Class A CDL', licenseExpiryDate: addDays(today, 120), contactNumber: '+1-555-0192', safetyScore: 92, status: 'Available' },
      { name: 'Robert Miller', licenseNumber: 'DL-882194', licenseCategory: 'Class B CDL', licenseExpiryDate: addDays(today, -10), contactNumber: '+1-555-0143', safetyScore: 78, status: 'Available' }, // Expired license
      { name: 'Maria Gomez', licenseNumber: 'DL-773412', licenseCategory: 'Class A CDL', licenseExpiryDate: addDays(today, 4), contactNumber: '+1-555-0182', safetyScore: 95, status: 'Available' },  // Near expiry (4 days)
      { name: 'David Smith', licenseNumber: 'DL-441298', licenseCategory: 'Class B CDL', licenseExpiryDate: addDays(today, 45), contactNumber: '+1-555-0167', safetyScore: 65, status: 'On Trip' },   // Near expiry (45 days) + low safety
      { name: 'James Wilson', licenseNumber: 'DL-552918', licenseCategory: 'Class A CDL', licenseExpiryDate: addDays(today, 300), contactNumber: '+1-555-0111', safetyScore: 50, status: 'Suspended' }, // Low safety score + Suspended
      { name: 'Sarah Patel', licenseNumber: 'DL-661029', licenseCategory: 'Class B CDL', licenseExpiryDate: addDays(today, 450), contactNumber: '+1-555-0155', safetyScore: 98, status: 'On Trip' },
      { name: 'Charles Brown', licenseNumber: 'DL-110022', licenseCategory: 'Class A CDL', licenseExpiryDate: addDays(today, 600), contactNumber: '+1-555-0122', safetyScore: 88, status: 'Available' },
      { name: 'Lisa Taylor', licenseNumber: 'DL-334455', licenseCategory: 'Class B CDL', licenseExpiryDate: addDays(today, 730), contactNumber: '+1-555-0177', safetyScore: 84, status: 'Off Duty' }
    ];

    const seededDrivers = await Driver.insertMany(drivers);
    console.log(`Seeded ${seededDrivers.length} drivers.`);

    // Create Initial Activity Logs
    const activities = [
      { action: "Vehicle status changed from 'Available' to 'On Trip' for registration number: VAN-002", entityType: 'Vehicle', entityId: seededVehicles[1]._id, timestamp: addDays(today, -2) },
      { action: "Driver status changed from 'Available' to 'On Trip' for driver: David Smith", entityType: 'Driver', entityId: seededDrivers[3]._id, timestamp: addDays(today, -2) },
      { action: "Vehicle status changed from 'Available' to 'In Shop' for registration number: VAN-003", entityType: 'Vehicle', entityId: seededVehicles[2]._id, timestamp: addDays(today, -1) },
      { action: "Driver status changed from 'Available' to 'Suspended' for driver: James Wilson due to multiple minor safety flags", entityType: 'Driver', entityId: seededDrivers[4]._id, timestamp: addDays(today, -1) }
    ];

    await ActivityLog.insertMany(activities);
    console.log('Seeded initial activity logs.');

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
