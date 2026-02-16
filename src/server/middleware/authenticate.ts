import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import type { AccessTokenPayload } from '../types/auth.js';

/**
 * Extend Express Request type to include user from JWT
 */
export interface AuthenticatedRequest extends Request {
  user?: AccessTokenPayload;
}

/**
 * Middleware that requires a valid JWT access token.
 * Extracts Bearer token from Authorization header, verifies it,
 * and attaches the payload to req.user.
 * Returns 401 if token is missing or invalid.
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Middleware that optionally authenticates a request.
 * If a valid token is present, attaches user to req.user.
 * If no token or invalid token, continues without attaching user.
 * Does NOT return 401 - allows anonymous access.
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      next();
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      next();
      return;
    }

    const payload = verifyAccessToken(token);

    if (payload) {
      req.user = payload;
    }

    next();
  } catch (error) {
    // Silently continue without user if token verification fails
    next();
  }
};
