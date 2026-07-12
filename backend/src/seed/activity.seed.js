import ActivityLog from '../shared/models/ActivityLog.js';

/**
 * Seed activity logs with realistic transit operations data.
 * @param {Array} users - Created user documents
 * @param {Array} vehicles - Created vehicle documents
 * @param {Array} drivers - Created driver documents
 * @returns {Promise<number>} Number of logs created
 */
export const seedActivityLogs = async (users, vehicles, drivers) => {
  const fleetManager = users.find((u) => u.role === 'Fleet Manager');
  const safetyOfficer = users.find((u) => u.role === 'Safety Officer');
  const driverUser = users.find((u) => u.role === 'Driver');

  const now = new Date();
  const hoursAgo = (h) => new Date(now.getTime() - h * 60 * 60 * 1000);
  const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  const logs = [
    // ── Auth logs ───────────────────────────────────────────────────
    {
      actor: fleetManager.name,
      actorId: fleetManager._id,
      actorName: fleetManager.name,
      action: `User "${fleetManager.name}" logged in`,
      entityType: 'Auth',
      entityId: fleetManager._id,
      timestamp: hoursAgo(1),
    },
    {
      actor: safetyOfficer.name,
      actorId: safetyOfficer._id,
      actorName: safetyOfficer.name,
      action: `User "${safetyOfficer.name}" logged in`,
      entityType: 'Auth',
      entityId: safetyOfficer._id,
      timestamp: hoursAgo(2),
    },
    {
      actor: driverUser.name,
      actorId: driverUser._id,
      actorName: driverUser.name,
      action: `User "${driverUser.name}" logged in`,
      entityType: 'Auth',
      entityId: driverUser._id,
      timestamp: hoursAgo(3),
    },

    // ── Vehicle logs ────────────────────────────────────────────────
    {
      actor: fleetManager.name,
      actorId: fleetManager._id,
      actorName: fleetManager.name,
      action: `Added new vehicle "${vehicles[0].name}" (${vehicles[0].regNumber})`,
      entityType: 'Vehicle',
      entityId: vehicles[0]._id,
      timestamp: daysAgo(5),
    },
    {
      actor: fleetManager.name,
      actorId: fleetManager._id,
      actorName: fleetManager.name,
      action: `Updated vehicle "${vehicles[1].name}" status to "On Trip"`,
      entityType: 'Vehicle',
      entityId: vehicles[1]._id,
      timestamp: hoursAgo(4),
    },
    {
      actor: fleetManager.name,
      actorId: fleetManager._id,
      actorName: fleetManager.name,
      action: `Sent vehicle "${vehicles[4].name}" to maintenance`,
      entityType: 'Vehicle',
      entityId: vehicles[4]._id,
      timestamp: daysAgo(1),
    },
    {
      actor: fleetManager.name,
      actorId: fleetManager._id,
      actorName: fleetManager.name,
      action: `Retired vehicle "${vehicles[10].name}" (${vehicles[10].regNumber})`,
      entityType: 'Vehicle',
      entityId: vehicles[10]._id,
      timestamp: daysAgo(3),
    },
    {
      actor: fleetManager.name,
      actorId: fleetManager._id,
      actorName: fleetManager.name,
      action: `Added new electric bus "${vehicles[6].name}" to fleet`,
      entityType: 'Vehicle',
      entityId: vehicles[6]._id,
      timestamp: daysAgo(7),
    },

    // ── Driver logs ─────────────────────────────────────────────────
    {
      actor: fleetManager.name,
      actorId: fleetManager._id,
      actorName: fleetManager.name,
      action: `Registered new driver "${drivers[0].name}"`,
      entityType: 'Driver',
      entityId: drivers[0]._id,
      timestamp: daysAgo(10),
    },
    {
      actor: safetyOfficer.name,
      actorId: safetyOfficer._id,
      actorName: safetyOfficer.name,
      action: `Updated safety score for "${drivers[3].name}" to ${drivers[3].safetyScore}`,
      entityType: 'Driver',
      entityId: drivers[3]._id,
      timestamp: daysAgo(2),
    },
    {
      actor: safetyOfficer.name,
      actorId: safetyOfficer._id,
      actorName: safetyOfficer.name,
      action: `Suspended driver "${drivers[7].name}" due to safety violations`,
      entityType: 'Driver',
      entityId: drivers[7]._id,
      timestamp: daysAgo(1),
    },
    {
      actor: fleetManager.name,
      actorId: fleetManager._id,
      actorName: fleetManager.name,
      action: `Assigned driver "${drivers[1].name}" to vehicle "${vehicles[2].name}"`,
      entityType: 'Driver',
      entityId: drivers[1]._id,
      timestamp: hoursAgo(5),
    },

    // ── User management logs ────────────────────────────────────────
    {
      actor: fleetManager.name,
      actorId: fleetManager._id,
      actorName: fleetManager.name,
      action: `Created new user account for "${users[2].name}"`,
      entityType: 'User',
      entityId: users[2]._id,
      timestamp: daysAgo(14),
    },
    {
      actor: fleetManager.name,
      actorId: fleetManager._id,
      actorName: fleetManager.name,
      action: `Updated role for "${users[3].name}" to Financial Analyst`,
      entityType: 'User',
      entityId: users[3]._id,
      timestamp: daysAgo(8),
    },

    // ── Trip logs ───────────────────────────────────────────────────
    {
      actor: fleetManager.name,
      actorId: fleetManager._id,
      actorName: fleetManager.name,
      action: 'Created trip "Mumbai Central → Thane" on route MH-101',
      entityType: 'Trip',
      timestamp: hoursAgo(6),
    },
    {
      actor: driverUser.name,
      actorId: driverUser._id,
      actorName: driverUser.name,
      action: 'Started trip "Mumbai Central → Thane"',
      entityType: 'Trip',
      timestamp: hoursAgo(5),
    },
    {
      actor: fleetManager.name,
      actorId: fleetManager._id,
      actorName: fleetManager.name,
      action: 'Created trip "Delhi ISBT → Gurgaon" on route DL-202',
      entityType: 'Trip',
      timestamp: daysAgo(1),
    },

    // ── Maintenance logs ────────────────────────────────────────────
    {
      actor: fleetManager.name,
      actorId: fleetManager._id,
      actorName: fleetManager.name,
      action: `Scheduled maintenance for "${vehicles[4].name}" — brake pad replacement`,
      entityType: 'Maintenance',
      entityId: vehicles[4]._id,
      timestamp: daysAgo(1),
    },
    {
      actor: 'System',
      actorName: 'System',
      action: `Maintenance alert: "${vehicles[8].name}" odometer crossed 200,000 km service threshold`,
      entityType: 'Maintenance',
      entityId: vehicles[8]._id,
      timestamp: daysAgo(2),
    },
  ];

  const createdLogs = await ActivityLog.insertMany(logs);
  return createdLogs.length;
};
