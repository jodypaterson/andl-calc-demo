import { PrismaClient, User, Session } from '@prisma/client';
import { comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';

const prisma = new PrismaClient();

// Constants
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Result types
export interface AuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
}

export class AuthService {
  /**
   * Check if user account is locked due to failed login attempts
   * @throws Error if account is locked
   */
  private async checkLockout(user: User): Promise<void> {
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const remainingMs = user.lockoutUntil.getTime() - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      throw new Error(`Account locked. Try again in ${remainingMinutes} minute(s).`);
    }
  }

  /**
   * Record a failed login attempt and lock account if threshold reached
   */
  private async recordFailedAttempt(userId: number): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const newAttempts = user.failedLoginAttempts + 1;
    const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;

    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: newAttempts,
        lockoutUntil: shouldLock 
          ? new Date(Date.now() + LOCKOUT_DURATION_MS)
          : undefined
      }
    });
  }

  /**
   * Authenticate user with username and password
   * Implements brute force protection via account lockout
   */
  async login(username: string, password: string): Promise<AuthResult> {
    try {
      // Find user
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Check lockout
      try {
        await this.checkLockout(user);
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Account locked'
        };
      }

      // Verify password
      const isValid = await comparePassword(password, user.passwordHash);
      if (!isValid) {
        await this.recordFailedAttempt(user.id);
        return { success: false, error: 'Invalid credentials' };
      }

      // Success - reset failed attempts
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockoutUntil: null
        }
      });

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        username: user.username,
        tokenVersion: user.tokenVersion
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Create session
      await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });

      return {
        success: true,
        accessToken,
        refreshToken
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Logout user by deleting session and incrementing token version
   * This invalidates all existing refresh tokens
   */
  async logout(userId: number, sessionId: string): Promise<void> {
    // Delete session
    await prisma.session.delete({
      where: { id: sessionId }
    });

    // Increment token version to invalidate all refresh tokens
    await prisma.user.update({
      where: { id: userId },
      data: {
        tokenVersion: { increment: 1 }
      }
    });
  }

  /**
   * Refresh access token using refresh token
   * Validates token version to detect invalidated tokens
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify token signature and expiration
      const payload = verifyToken(refreshToken);

      // Find session
      const session = await prisma.session.findFirst({
        where: { refreshToken },
        include: { user: true }
      });

      if (!session) {
        throw new Error('Session not found');
      }

      // Check if session expired
      if (session.expiresAt < new Date()) {
        throw new Error('Session expired');
      }

      // Verify token version matches (detect invalidated tokens)
      if (payload.tokenVersion !== session.user.tokenVersion) {
        throw new Error('Token invalidated');
      }

      // Generate new access token
      const newAccessToken = generateAccessToken({
        userId: session.user.id,
        username: session.user.username,
        tokenVersion: session.user.tokenVersion
      });

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Token refresh failed'
      );
    }
  }

  /**
   * Validate and retrieve session by ID
   * Returns null if session not found or expired
   */
  async validateSession(sessionId: string): Promise<Session | null> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return null;
    }

    // Check expiration
    if (session.expiresAt < new Date()) {
      return null;
    }

    return session;
  }
}
