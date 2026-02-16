import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler middleware
 * Catches all errors and formats them consistently
 */
export default function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error for monitoring
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Determine status code
  const statusCode = (err as any).statusCode || (err as any).status || 500;

  // Send error response
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode,
      path: req.path,
    },
  });
}
