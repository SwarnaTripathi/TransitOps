import User from "../../shared/models/User.js";
import { comparePassword } from "../../shared/utils/hash.js";
import { generateToken } from "../../shared/utils/jwt.js";
import { createLog } from "../../shared/services/activityLog.service.js";

/**
 * Authenticate a user by email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object, token: string}>}
 */
const loginUser = async (email, password) => {
  // Find user with password included (since we have select: false on password)
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Account is deactivated. Contact an administrator.");
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT
  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  // Log the login activity
  await createLog({
    actor: user.name,
    action: `User "${user.name}" logged in`,
    entityType: "Auth",
    entityId: user._id,
  });

  // Return user without password
  const userObj = user.toJSON();

  return { user: userObj, token };
};

/**
 * Get current user profile by ID.
 * @param {string} userId
 * @returns {Promise<object>} User document without password
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

export { loginUser, getCurrentUser };
