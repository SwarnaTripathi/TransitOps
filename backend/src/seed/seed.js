import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Models
import User from '../shared/models/User.js';
import Role from '../shared/models/Role.js';
import Vehicle from '../modules/vehicles/Vehicle.js';
import Driver from '../modules/drivers/Driver.js';
import ActivityLog from '../shared/models/ActivityLog.js';

// Seed data
import { seedActivityLogs } from './activity.seed.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/transitops';

// ── Role seed data ──────────────────────────────────────────────────────────
const roles = [
  {
    name: 'Fleet Manager',
    description: 'Full access to manage fleet operations, vehicles, drivers, and reports.',
    permissions: ['manage_vehicles', 'manage_drivers', 'manage_trips', 'view_reports', 'manage_users'],
    isActive: true,
  },
  {
    name: 'Driver',
    description: 'Can view assigned trips, update trip status, and view own profile.',
    permissions: ['view_trips', 'update_trip_status', 'view_profile'],
    isActive: true,
  },
  {
    name: 'Safety Officer',
    description: 'Can view safety reports, driver scores, and incident logs.',
    permissions: ['view_reports', 'view_drivers', 'manage_safety', 'view_incidents'],
    isActive: true,
  },
  {
    name: 'Financial Analyst',
    description: 'Can view financial reports, costs, and budget analysis.',
    permissions: ['view_reports', 'view_finances', 'view_costs', 'export_reports'],
    isActive: true,
  },
];

// ── User seed data ──────────────────────────────────────────────────────────
const users = [
  {
    name: 'Admin',
    email: 'admin@transitops.com',
    password: 'admin123',
    role: 'Fleet Manager',
    phone: '+91-9876543210',
    isActive: true,
  },
  {
    name: 'Priya Sharma',
    email: 'safety@transitops.com',
    password: 'safety123',
    role: 'Safety Officer',
    phone: '+91-9876543211',
    isActive: true,
  },
  {
    name: 'Amit Patel',
    email: 'driver@transitops.com',
    password: 'driver123',
    role: 'Driver',
    phone: '+91-9876543212',
    isActive: true,
  },
  {
    name: 'Sneha Reddy',
    email: 'finance@transitops.com',
    password: 'finance123',
    role: 'Financial Analyst',
    phone: '+91-9876543213',
    isActive: true,
  },
  {
    name: 'Vikram Singh',
    email: 'driver2@transitops.com',
    password: 'driver123',
    role: 'Driver',
    phone: '+91-9876543214',
    isActive: true,
  },
  {
    name: 'Ananya Gupta',
    email: 'manager@transitops.com',
    password: 'manager123',
    role: 'Fleet Manager',
    phone: '+91-9876543215',
    isActive: true,
  },
];

// ── Vehicle seed data ───────────────────────────────────────────────────────
const vehicles = [
  {
    regNumber: 'MH-01-AB-1234',
    name: 'City Express 1',
    type: 'Bus',
    maxLoadCapacity: 50,
    odometer: 125340,
    acquisitionCost: 3500000,
    status: 'Available',
    region: 'Mumbai',
  },
  {
    regNumber: 'MH-01-CD-5678',
    name: 'Metro Shuttle A',
    type: 'Mini Bus',
    maxLoadCapacity: 25,
    odometer: 87200,
    acquisitionCost: 1800000,
    status: 'On Trip',
    region: 'Mumbai',
  },
  {
    regNumber: 'DL-02-EF-9012',
    name: 'Capital Liner 3',
    type: 'Bus',
    maxLoadCapacity: 55,
    odometer: 210500,
    acquisitionCost: 4200000,
    status: 'Available',
    region: 'Delhi',
  },
  {
    regNumber: 'KA-03-GH-3456',
    name: 'Tech Park Shuttle',
    type: 'Van',
    maxLoadCapacity: 12,
    odometer: 45600,
    acquisitionCost: 1200000,
    status: 'On Trip',
    region: 'Bangalore',
  },
  {
    regNumber: 'TN-04-IJ-7890',
    name: 'Chennai Express 2',
    type: 'Bus',
    maxLoadCapacity: 48,
    odometer: 156800,
    acquisitionCost: 3200000,
    status: 'In Shop',
    region: 'Chennai',
  },
  {
    regNumber: 'MH-01-KL-2345',
    name: 'Harbor Line Van',
    type: 'Van',
    maxLoadCapacity: 10,
    odometer: 32100,
    acquisitionCost: 950000,
    status: 'Available',
    region: 'Mumbai',
  },
  {
    regNumber: 'DL-02-MN-6789',
    name: 'Green Line Bus',
    type: 'Electric Bus',
    maxLoadCapacity: 40,
    odometer: 18500,
    acquisitionCost: 5500000,
    status: 'Available',
    region: 'Delhi',
  },
  {
    regNumber: 'KA-03-OP-1234',
    name: 'Airport Connector',
    type: 'Mini Bus',
    maxLoadCapacity: 30,
    odometer: 67800,
    acquisitionCost: 2100000,
    status: 'On Trip',
    region: 'Bangalore',
  },
  {
    regNumber: 'GJ-05-QR-5678',
    name: 'Ahmedabad City Bus',
    type: 'Bus',
    maxLoadCapacity: 52,
    odometer: 198400,
    acquisitionCost: 3000000,
    status: 'Available',
    region: 'Ahmedabad',
  },
  {
    regNumber: 'RJ-06-ST-9012',
    name: 'Pink City Shuttle',
    type: 'Mini Bus',
    maxLoadCapacity: 20,
    odometer: 54300,
    acquisitionCost: 1500000,
    status: 'Available',
    region: 'Jaipur',
  },
  {
    regNumber: 'TN-04-UV-3456',
    name: 'Coromandel Van',
    type: 'Van',
    maxLoadCapacity: 8,
    odometer: 28700,
    acquisitionCost: 800000,
    status: 'Retired',
    region: 'Chennai',
  },
  {
    regNumber: 'MH-01-WX-7890',
    name: 'Western Express 4',
    type: 'Bus',
    maxLoadCapacity: 50,
    odometer: 142000,
    acquisitionCost: 3600000,
    status: 'Available',
    region: 'Mumbai',
  },
];

// ── Driver seed data ────────────────────────────────────────────────────────
const drivers = [
  {
    name: 'Suresh Yadav',
    licenseNumber: 'MH-DL-2020-001234',
    licenseCategory: 'HMV',
    licenseExpiryDate: new Date('2027-06-15'),
    contactNumber: '+91-9800000001',
    safetyScore: 92,
    status: 'Available',
  },
  {
    name: 'Ramesh Joshi',
    licenseNumber: 'DL-DL-2019-005678',
    licenseCategory: 'HMV',
    licenseExpiryDate: new Date('2026-12-30'),
    contactNumber: '+91-9800000002',
    safetyScore: 88,
    status: 'On Trip',
  },
  {
    name: 'Deepak Verma',
    licenseNumber: 'KA-DL-2021-009012',
    licenseCategory: 'LMV',
    licenseExpiryDate: new Date('2028-03-20'),
    contactNumber: '+91-9800000003',
    safetyScore: 95,
    status: 'On Trip',
  },
  {
    name: 'Manoj Tiwari',
    licenseNumber: 'TN-DL-2018-003456',
    licenseCategory: 'HMV',
    licenseExpiryDate: new Date('2026-09-10'),
    contactNumber: '+91-9800000004',
    safetyScore: 78,
    status: 'Off Duty',
  },
  {
    name: 'Kiran Deshmukh',
    licenseNumber: 'MH-DL-2022-007890',
    licenseCategory: 'HMV',
    licenseExpiryDate: new Date('2029-01-25'),
    contactNumber: '+91-9800000005',
    safetyScore: 97,
    status: 'Available',
  },
  {
    name: 'Ajay Nair',
    licenseNumber: 'KA-DL-2020-002345',
    licenseCategory: 'LMV',
    licenseExpiryDate: new Date('2027-08-12'),
    contactNumber: '+91-9800000006',
    safetyScore: 85,
    status: 'On Trip',
  },
  {
    name: 'Prakash Mehta',
    licenseNumber: 'GJ-DL-2019-006789',
    licenseCategory: 'HMV',
    licenseExpiryDate: new Date('2026-11-05'),
    contactNumber: '+91-9800000007',
    safetyScore: 91,
    status: 'Available',
  },
  {
    name: 'Sanjay Raut',
    licenseNumber: 'RJ-DL-2021-001234',
    licenseCategory: 'HMV',
    licenseExpiryDate: new Date('2028-07-18'),
    contactNumber: '+91-9800000008',
    safetyScore: 64,
    status: 'Suspended',
  },
];

// ── Main seed function ──────────────────────────────────────────────────────
const seedDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // ── Clear existing data ───────────────────────────────────────────
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Role.deleteMany({}),
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      Driver.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);
    console.log('✅ Existing data cleared\n');

    // ── Seed Roles ────────────────────────────────────────────────────
    console.log('📋 Seeding roles...');
    const createdRoles = await Role.insertMany(roles);
    console.log(`   ✅ ${createdRoles.length} roles created`);

    // ── Seed Users ────────────────────────────────────────────────────
    console.log('👤 Seeding users...');
    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save(); // triggers pre-save hook to hash password
      createdUsers.push(user);
    }
    console.log(`   ✅ ${createdUsers.length} users created`);

    // ── Seed Vehicles ─────────────────────────────────────────────────
    console.log('🚌 Seeding vehicles...');
    const createdVehicles = await Vehicle.insertMany(vehicles);
    console.log(`   ✅ ${createdVehicles.length} vehicles created`);

    // ── Seed Drivers ──────────────────────────────────────────────────
    console.log('🧑‍✈️ Seeding drivers...');
    const createdDrivers = await Driver.insertMany(drivers);
    console.log(`   ✅ ${createdDrivers.length} drivers created`);

    // ── Seed Activity Logs ────────────────────────────────────────────
    console.log('📝 Seeding activity logs...');
    const logCount = await seedActivityLogs(createdUsers, createdVehicles, createdDrivers);
    console.log(`   ✅ ${logCount} activity logs created`);

    // ── Summary ───────────────────────────────────────────────────────
    console.log('\n🎉 Database seeded successfully!');
    console.log('─'.repeat(40));
    console.log(`   Roles:         ${createdRoles.length}`);
    console.log(`   Users:         ${createdUsers.length}`);
    console.log(`   Vehicles:      ${createdVehicles.length}`);
    console.log(`   Drivers:       ${createdDrivers.length}`);
    console.log(`   Activity Logs: ${logCount}`);
    console.log('─'.repeat(40));

    console.log('\n📧 Login credentials:');
    users.forEach((u) => {
      console.log(`   ${u.role.padEnd(20)} → ${u.email.padEnd(28)} / ${u.password}`);
    });

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed.');
    process.exit(0);
  }
};

seedDatabase();
