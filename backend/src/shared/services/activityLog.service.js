import ActivityLog from "../models/ActivityLog.js";

/**
 * Create a new activity log entry.
 * @param {object} params
 * @param {string} params.actor - Display name of the actor
 * @param {string} params.action - Description of the action performed
 * @param {string} params.entityType - Type of entity (User, Vehicle, Driver, etc.)
 * @param {string} [params.entityId] - MongoDB ObjectId of the related entity
 * @returns {Promise<object>} Created activity log document
 */
const createLog = async ({ actor, action, entityType, entityId }) => {
  try {
    const log = await ActivityLog.create({
      actor: actor || "System",
      actorName: actor || "System",
      action,
      entityType,
      entityId: entityId || undefined,
    });
    return log;
  } catch (error) {
    console.error("Activity log creation failed:", error.message);
    return null; // Non-blocking: don't break the main flow on logging failure
  }
};

/**
 * Fetch recent activity logs with optional filters.
 * @param {object} options
 * @param {number} [options.limit] - Max number of logs to fetch
 * @param {string} [options.entityType] - Filter by entity type
 * @returns {Promise<object[]>} Array of activity log documents
 */
const getRecentLogs = async ({ limit = 20, entityType } = {}) => {
  const filter = {};
  if (entityType) filter.entityType = entityType;

  return ActivityLog.find(filter).sort({ timestamp: -1 }).limit(limit).lean();
};

export { createLog, getRecentLogs };
