/**
 * Send a standardized success response.
 * @param {object} res - Express response object
 * @param {object} data - Response data payload
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default 200)
 */
const sendSuccess = (res, data = null, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send a standardized error response.
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {string} code - Error code identifier
 */
const sendError = (res, message = "Internal Server Error", statusCode = 500, code = "SERVER_ERROR") => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};

export { sendSuccess, sendError };
