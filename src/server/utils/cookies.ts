/**
 * Secure cookie management utilities for refresh tokens.
 * Implements OWASP cookie security guidelines.
 * @module cookies
 */

import type { Request, Response } from 'express';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Sets the refresh token as a secure HTTP-only cookie.
 * Cookie configuration prevents XSS attacks and ensures secure transmission.
 * 
 * Security features:
 * - httpOnly: Cookie not accessible via JavaScript (prevents XSS)
 * - secure: Only transmitted over HTTPS in production
 * - sameSite: Prevents CSRF attacks
 * - maxAge: 7 days expiration
 * 
 * @param res - Express response object
 * @param token - JWT refresh token string to store
 * 
 * @example
 * ```typescript
 * app.post('/login', (req, res) => {
 *   const refreshToken = generateRefreshToken(user.id, user.tokenVersion);
 *   setRefreshTokenCookie(res, refreshToken);
 *   res.json({ accessToken });
 * });
 * ```
 */
export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // CSRF protection
    maxAge: REFRESH_TOKEN_MAX_AGE, // 7 days
  });
}

/**
 * Clears the refresh token cookie.
 * Used during logout or when invalidating a refresh token.
 * 
 * @param res - Express response object
 * 
 * @example
 * ```typescript
 * app.post('/logout', (req, res) => {
 *   clearRefreshTokenCookie(res);
 *   res.json({ message: 'Logged out' });
 * });
 * ```
 */
export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
}

/**
 * Retrieves the refresh token from request cookies.
 * Returns undefined if cookie is not present.
 * 
 * @param req - Express request object
 * @returns Refresh token string or undefined
 * 
 * @example
 * ```typescript
 * app.post('/refresh', (req, res) => {
 *   const refreshToken = getRefreshTokenFromCookies(req);
 *   if (!refreshToken) {
 *     return res.status(401).json({ error: 'No refresh token' });
 *   }
 *   // Verify and issue new access token...
 * });
 * ```
 */
export function getRefreshTokenFromCookies(req: Request): string | undefined {
  return req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
}
