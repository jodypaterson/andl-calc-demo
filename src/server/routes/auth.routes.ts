import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { validate } from '../middleware/validate.js';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate.js';
import { loginSchema } from '../schemas/auth.schema.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/cookies.js';

const router = Router();

/**
 * POST /api/auth/login
 * Authenticate user with username and password.
 * On success: returns access token and user, sets refresh token cookie.
 */
router.post(
  '/login',
  validate({ body: loginSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, password } = req.body;

      const result = await AuthService.login(username, password);

      // Check if authentication failed
      if (!result.success) {
        res.status(401).json({ success: false, error: result.error || 'Authentication failed' });
        return;
      }

      // Set refresh token as httpOnly cookie (7 days)
      setRefreshTokenCookie(res, result.refreshToken);

      res.status(200).json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      // Return generic error message to prevent username enumeration
      res.status(401).json({ error: 'Invalid credentials' });
    }
  }
);

/**
 * POST /api/auth/logout
 * Invalidate the user's session and clear refresh token cookie.
 * Requires authentication (Bearer token).
 */
router.post(
  '/logout',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      clearTokenCookie(res, 'refreshToken');

      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Logout failed' });
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token from cookie.
 * Returns new access token and rotates refresh token.
 */
router.post(
  '/refresh',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ error: 'No refresh token provided' });
        return;
      }

      const result = await AuthService.refreshTokens(refreshToken);

      // Rotate refresh token
      setRefreshTokenCookie(res, result.refreshToken);

      res.status(200).json({
        accessToken: result.accessToken,
      });
    } catch (error) {
      // Clear invalid refresh token
      clearTokenCookie(res, 'refreshToken');
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }
);

export default router;
