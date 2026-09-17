import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware factory for Joi request validation
 * @param {import('joi').ObjectSchema} schema - Joi schema object
 * @param {'body' | 'query' | 'params'} [source='body'] - Request source object to validate
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));
      return next(new ApiError(400, 'Validation Error', errorDetails));
    }

    req[source] = value;
    next();
  };
};
