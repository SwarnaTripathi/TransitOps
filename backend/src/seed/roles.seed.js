export const roles = [
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
