import { sendError } from "../../shared/utils/response.js";

/**
 * Validate login request body.
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return sendError(res, "Email is required.", 400, "VALIDATION_ERROR");
  }

  if (!password || !password.trim()) {
    return sendError(res, "Password is required.", 400, "VALIDATION_ERROR");
  }

  // Basic email format validation
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email.trim())) {
    return sendError(res, "Please provide a valid email address.", 400, "VALIDATION_ERROR");
  }

  next();
};

/**
 * Validate user creation / registration request body.
 */
const validateCreateUser = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || name.trim().length < 2) {
    return sendError(res, "Name is required and must be at least 2 characters.", 400, "VALIDATION_ERROR");
  }

  if (!email || !email.trim()) {
    return sendError(res, "Email is required.", 400, "VALIDATION_ERROR");
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email.trim())) {
    return sendError(res, "Please provide a valid email address.", 400, "VALIDATION_ERROR");
  }

  if (!password || password.length < 6) {
    return sendError(res, "Password must be at least 6 characters.", 400, "VALIDATION_ERROR");
  }

  const validRoles = ["Admin", "Driver", "Safety Officer", "Financial Analyst"];
  if (role && !validRoles.includes(role)) {
    return sendError(
      res,
      `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      400,
      "VALIDATION_ERROR"
    );
  }

  next();
};

/**
 * Validate user update request body.
 */
const validateUpdateUser = (req, res, next) => {
  const { name, email, role } = req.body;

  if (name !== undefined && name.trim().length < 2) {
    return sendError(res, "Name must be at least 2 characters.", 400, "VALIDATION_ERROR");
  }

  if (email !== undefined) {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return sendError(res, "Please provide a valid email address.", 400, "VALIDATION_ERROR");
    }
  }

  const validRoles = ["Admin", "Driver", "Safety Officer", "Financial Analyst"];
  if (role && !validRoles.includes(role)) {
    return sendError(
      res,
      `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      400,
      "VALIDATION_ERROR"
    );
  }

  next();
};

export { validateLogin, validateCreateUser, validateUpdateUser };
