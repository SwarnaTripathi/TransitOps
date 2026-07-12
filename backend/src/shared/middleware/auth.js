/**
 * Stub authentication and authorization middleware.
 * Reads 'x-user-role' and 'x-user-name' from headers to allow role-swapping during testing.
 * Falls back to default 'fleet_manager' if no headers are provided.
 */

export const authGuard = (req, res, next) => {
  const role = req.headers['x-user-role'] || 'fleet_manager';
  const name = req.headers['x-user-name'] || 'Demo User';
  
  // Attach user object to request
  req.user = {
    _id: '60c72b2f9b1d8b2d88888888', // Mock ObjectId
    name,
    email: 'demo@transitops.com',
    role
  };
  
  next();
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User authentication required' }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: `Access denied. Requires one of: ${allowedRoles.join(', ')}` }
      });
    }

    next();
  };
};
