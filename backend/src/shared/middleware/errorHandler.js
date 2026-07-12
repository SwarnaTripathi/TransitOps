/**
 * Global error handler middleware.
 * Catches any unhandled errors and returns a standardized JSON error response.
 */
const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${err.stack || err.message}`);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: messages.join(", "),
      },
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(", ");
    return res.status(409).json({
      success: false,
      error: {
        code: "DUPLICATE_KEY",
        message: `Duplicate value for field(s): ${field}`,
      },
    });
  }

  // Mongoose cast error (bad ObjectId, etc.)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_ID",
        message: `Invalid value for ${err.path}: ${err.value}`,
      },
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: {
        code: "AUTH_ERROR",
        message: err.message,
      },
    });
  }

  // Default server error
  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    success: false,
    error: {
      code: "SERVER_ERROR",
      message: err.message || "An unexpected error occurred",
    },
  });
};

export { errorHandler };
