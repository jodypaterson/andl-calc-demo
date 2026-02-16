import { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware
 * Handles common error types and provides consistent error responses
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error for debugging
  console.error('[Error Handler]', err);

  // Handle Multer errors (file upload errors)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'File too large. Maximum size is 5MB.' });
      return;
    }
    res.status(400).json({ error: `File upload error: ${err.message}` });
    return;
  }

  // Handle custom application errors
  if ('statusCode' in err && typeof err.statusCode === 'number') {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Default to 500 for unknown errors
  res.status(500).json({ error: 'Internal server error' });
}
