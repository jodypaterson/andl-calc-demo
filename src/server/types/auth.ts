/**
 * Authentication type definitions for JWT tokens and user data.
 * @module auth
 */

/**
 * User data used for token generation.
 */
export interface TokenUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

/**
 * Payload structure for access tokens.
 * Access tokens are short-lived (15 minutes) and include full user context.
 */
export interface AccessTokenPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Payload structure for refresh tokens.
 * Refresh tokens are long-lived (7 days) and only include minimal user identification.
 */
export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
  iat: number;
  exp: number;
}
