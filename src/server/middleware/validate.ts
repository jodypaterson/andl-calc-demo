import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Configuration for request validation schemas.
 * Each property corresponds to a part of the Express Request object.
 */
export interface ValidationSchemas {
  /** Schema to validate request body */
  body?: ZodSchema;
  /** Schema to validate request params */
  params?: ZodSchema;
  /** Schema to validate request query */
  query?: ZodSchema;
}

/**
 * Error response format for validation failures.
 */
interface ValidationErrorResponse {
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: ZodError['issues'];
  };
}

/**
 * Creates Express middleware that validates incoming requests against Zod schemas.
 * 
 * @param schemas - Optional schemas for validating body, params, and/or query
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * import { z } from 'zod';
 * import { validate } from './middleware/validate';
 * 
 * const loginSchema = z.object({
 *   username: z.string().min(3),
 *   password: z.string().min(8)
 * });
 * 
 * router.post('/login', validate({ body: loginSchema }), loginHandler);
 * ```
 */
export function validate(schemas: ValidationSchemas = {}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate body if schema provided
      if (schemas.body) {
        const bodyResult = schemas.body.safeParse(req.body);
        if (!bodyResult.success) {
          const errorResponse: ValidationErrorResponse = {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Request body validation failed',
              details: bodyResult.error.issues
            }
          };
          res.status(400).json(errorResponse);
          return;
        }
        // Replace with validated data (trimmed, coerced, etc.)
        req.body = bodyResult.data;
      }

      // Validate params if schema provided
      if (schemas.params) {
        const paramsResult = schemas.params.safeParse(req.params);
        if (!paramsResult.success) {
          const errorResponse: ValidationErrorResponse = {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Request params validation failed',
              details: paramsResult.error.issues
            }
          };
          res.status(400).json(errorResponse);
          return;
        }
        req.params = paramsResult.data;
      }

      // Validate query if schema provided
      if (schemas.query) {
        const queryResult = schemas.query.safeParse(req.query);
        if (!queryResult.success) {
          const errorResponse: ValidationErrorResponse = {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Request query validation failed',
              details: queryResult.error.issues
            }
          };
          res.status(400).json(errorResponse);
          return;
        }
        req.query = queryResult.data;
      }

      // All validations passed, proceed to next middleware
      next();
    } catch (error) {
      // Unexpected error during validation
      next(error);
    }
  };
}
