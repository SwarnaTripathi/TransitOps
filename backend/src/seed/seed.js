import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Models
import User from '../shared/models/User.js';
import Role from '../shared/models/Role.js';
import Vehicle from '../modules/vehicles/Vehicle.js';
import Driver from '../modules/drivers/Driver.js';
import ActivityLog from '../shared/models/ActivityLog.js';

// Seed data
import { roles } from './roles.seed.js';
import { users } from './users.seed.js';
import { vehicles } from './vehicles.seed.js';
import { drivers } from './drivers.seed.js';
import { seedActivityLogs } from './activity.seed.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI

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
