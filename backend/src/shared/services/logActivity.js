// shared/services/logActivity.js
// One-line writer for the shared ActivityLog collection (Feature 3 — Dashboard feed).
// Every module that changes a status calls this to create an audit trail.

import ActivityLog from '../models/ActivityLog.js';

/**
 * Write a single activity entry to the ActivityLog collection.
 * Silently catches errors so a logging failure never breaks business logic.
 * @param {{ actor: object, action: string, entityType: string, entityId: string }} params
 */
export async function logActivity({ actor, action, entityType, entityId }) {
  try {
    await ActivityLog.create({
      actorId: actor?._id || null,
      actorName: actor?.name || "System",
      action,
      entityType,
      entityId,
      timestamp: new Date(),
    });
  } catch (err) {
    // Never let a logging failure break the actual business operation
    console.error("ActivityLog write failed:", err.message);
  }
}
