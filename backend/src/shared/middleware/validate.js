import { z } from 'zod';

/**
 * Express middleware to validate request body, query, or params using Zod schemas.
 * @param {z.ZodObject} schema - The Zod schema to validate against
 * @param {'body' | 'query' | 'params'} property - Which part of the request to validate (default: 'body')
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      // Validate and parse the data
      const parsedData = schema.parse(req[property]);
      // Replace the request data with the validated/parsed data
      req[property] = parsedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod errors nicely
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errorMessages
          }
        });
      }
      next(error);
    }
  };
};
