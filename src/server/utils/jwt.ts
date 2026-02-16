/**
 * JWT token generation and verification utilities.
 * Implements OWASP JWT security guidelines with separate secrets for access and refresh tokens.
 * @module jwt
 */

import jwt from 'jsonwebtoken';
import type { TokenUser, AccessTokenPayload, RefreshTokenPayload } from '../types/auth.js';

// Environment variable validation
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Runtime validation of secrets
if (!JWT_ACCESS_SECRET || JWT_ACCESS_SECRET.length < 32) {
  throw new Error('JWT_ACCESS_SECRET must be at least 32 characters');
}
if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET.length < 32) {
  throw new Error('JWT_REFRESH_SECRET must be at least 32 characters');
}

/**
 * Generates a short-lived access token containing full user context.
 * Access tokens are delivered in response body and used for API authorization.
 * 
 * @param user - User data to encode in the token
 * @returns Signed JWT access token string
 * 
 * @example
 * ```typescript
 * const token = generateAccessToken({
 *   id: 'user123',
 *   username: 'john',
 *   email: 'john@example.com',
 *   role: 'user'
 * });
 * ```
 */
export function generateAccessToken(user: TokenUser): string {
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
  });
}

/**
 * Generates a long-lived refresh token with minimal user identification.
 * Refresh tokens are delivered as HTTP-only cookies and used for silent token renewal.
 * 
 * @param userId - User ID to encode in the token
 * @param tokenVersion - Version number for token invalidation
 * @returns Signed JWT refresh token string
 * 
 * @example
 * ```typescript
 * const refreshToken = generateRefreshToken('user123', 1);
 * ```
 */
export function generateRefreshToken(userId: string, tokenVersion: number): string {
  const payload = {
    userId,
    tokenVersion,
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

/**
 * Verifies and decodes an access token.
 * Returns null on any failure (expired, invalid signature, malformed).
 * NEVER throws exceptions to prevent denial of service attacks.
 * 
 * @param token - JWT access token string to verify
 * @returns Decoded payload or null if invalid
 * 
 * @example
 * ```typescript
 * const payload = verifyAccessToken(token);
 * if (payload) {
 *   console.log('Valid token for user:', payload.userId);
 * } else {
 *   console.log('Invalid or expired token');
 * }
 * ```
 */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as AccessTokenPayload;
    return decoded;
  } catch {
    // Return null for any verification failure (expired, invalid, tampered)
    // Do not throw exceptions to avoid denial of service
    return null;
  }
}

/**
 * Verifies and decodes a refresh token.
 * Returns null on any failure (expired, invalid signature, malformed).
 * NEVER throws exceptions to prevent denial of service attacks.
 * 
 * @param token - JWT refresh token string to verify
 * @returns Decoded payload or null if invalid
 * 
 * @example
 * ```typescript
 * const payload = verifyRefreshToken(refreshToken);
 * if (payload) {
 *   console.log('Valid refresh token:', payload.userId);
 * } else {
 *   console.log('Invalid or expired refresh token');
 * }
 * ```
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
    return decoded;
  } catch {
    // Return null for any verification failure
    // Do not throw exceptions to avoid denial of service
    return null;
  }
}
