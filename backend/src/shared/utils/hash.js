import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hash a plain-text password.
 * @param {string} plainPassword
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plainPassword, salt);
};

/**
 * Compare a plain-text password with a hashed password.
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>} True if passwords match
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export { hashPassword, comparePassword };
