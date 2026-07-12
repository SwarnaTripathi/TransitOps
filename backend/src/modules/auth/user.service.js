import User from "../../shared/models/User.js";
import { createLog } from "../../shared/services/activityLog.service.js";

/**
 * Get all users (with optional filters).
 * @param {object} filters - { role, isActive, search }
 * @returns {Promise<object[]>} Array of user documents
 */
const getAllUsers = async (filters = {}) => {
  const query = {};

  if (filters.role) {
    query.role = filters.role;
  }

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive === "true" || filters.isActive === true;
  }

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, "i");
    query.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  return User.find(query).select("-password").sort({ createdAt: -1 }).lean();
};

/**
 * Get a single user by ID.
 * @param {string} userId
 * @returns {Promise<object>} User document
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

/**
 * Create a new user.
 * @param {object} userData - { name, email, password, role, phone }
 * @param {string} actorName - Name of the user performing the action
 * @returns {Promise<object>} Created user document
 */
const createUser = async (userData, actorName = "System") => {
  // Check for existing email
  const existing = await User.findOne({ email: userData.email.toLowerCase() });
  if (existing) {
    const error = new Error("A user with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name: userData.name.trim(),
    email: userData.email.toLowerCase().trim(),
    password: userData.password,
    role: userData.role || "Driver",
    phone: userData.phone || "",
  });

  // Log the activity
  await createLog({
    actor: actorName,
    action: `Created new user "${user.name}" with role "${user.role}"`,
    entityType: "User",
    entityId: user._id,
  });

  return user.toJSON();
};

/**
 * Update an existing user.
 * @param {string} userId
 * @param {object} updateData - Fields to update
 * @param {string} actorName - Name of the user performing the action
 * @returns {Promise<object>} Updated user document
 */
const updateUser = async (userId, updateData, actorName = "System") => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  // Only update allowed fields
  const allowedFields = ["name", "email", "role", "phone", "isActive"];
  const changes = [];

  for (const field of allowedFields) {
    if (updateData[field] !== undefined && updateData[field] !== user[field]) {
      changes.push(`${field}: "${user[field]}" → "${updateData[field]}"`);
      user[field] = updateData[field];
    }
  }

  // Handle password update separately
  if (updateData.password) {
    user.password = updateData.password;
    changes.push("password updated");
  }

  await user.save();

  // Log the update
  if (changes.length > 0) {
    await createLog({
      actor: actorName,
      action: `Updated user "${user.name}": ${changes.join(", ")}`,
      entityType: "User",
      entityId: user._id,
    });
  }

  return user.toJSON();
};

/**
 * Delete (deactivate) a user.
 * @param {string} userId
 * @param {string} actorName - Name of the user performing the action
 * @returns {Promise<object>} Deactivated user document
 */
const deleteUser = async (userId, actorName = "System") => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  // Soft delete: deactivate instead of hard delete
  user.isActive = false;
  await user.save();

  await createLog({
    actor: actorName,
    action: `Deactivated user "${user.name}"`,
    entityType: "User",
    entityId: user._id,
  });

  return user.toJSON();
};

export { getAllUsers, getUserById, createUser, updateUser, deleteUser };
