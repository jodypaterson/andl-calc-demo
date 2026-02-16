import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../../src/server/services/auth.service';
import * as passwordUtils from '../../src/server/utils/password';
import * as jwtUtils from '../../src/server/utils/jwt';

// Mock Prisma
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  })),
}));

// Mock utilities
vi.mock('../../src/server/utils/password');
vi.mock('../../src/server/utils/jwt');

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrisma: any;

  beforeEach(() => {
    authService = new AuthService();
    mockPrisma = new PrismaClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Brute Force Protection', () => {
    it('should lock account after 5 consecutive failed login attempts', async () => {
      const testUser = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hash123',
        failedLoginAttempts: 4,
        lockoutUntil: null,
        tokenVersion: 0,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(testUser);
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(false);

      // Simulate 5th failed attempt
      mockPrisma.user.update.mockResolvedValue({
        ...testUser,
        failedLoginAttempts: 5,
        lockoutUntil: new Date(Date.now() + 15 * 60 * 1000),
      });

      const result = await authService.login('test@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toContain('INVALID_CREDENTIALS');
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            failedLoginAttempts: 5,
            lockoutUntil: expect.any(Date),
          }),
        })
      );
    });

    it('should reject login attempt when account is locked', async () => {
      const lockoutUntil = new Date(Date.now() + 10 * 60 * 1000); // Locked for 10 more minutes
      const lockedUser = {
        id: 'user-2',
        email: 'locked@example.com',
        passwordHash: 'hash123',
        failedLoginAttempts: 5,
        lockoutUntil,
        tokenVersion: 0,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(lockedUser);

      const result = await authService.login('locked@example.com', 'correctpassword');

      expect(result.success).toBe(false);
      expect(result.error).toContain('ACCOUNT_LOCKED');
      expect(result.error).toMatch(/locked.*\d+.*minutes?/i);
    });

    it('should allow login after lockout period expires', async () => {
      const expiredLockout = new Date(Date.now() - 1000); // Lockout expired 1 second ago
      const unlockedUser = {
        id: 'user-3',
        email: 'unlocked@example.com',
        passwordHash: 'hash123',
        failedLoginAttempts: 5,
        lockoutUntil: expiredLockout,
        tokenVersion: 0,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(unlockedUser);
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(true);
      vi.mocked(jwtUtils.generateAccessToken).mockReturnValue('access-token');
      vi.mocked(jwtUtils.generateRefreshToken).mockReturnValue('refresh-token');

      mockPrisma.session.create.mockResolvedValue({
        id: 'session-1',
        userId: 'user-3',
        token: 'refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      });

      mockPrisma.user.update.mockResolvedValue({
        ...unlockedUser,
        failedLoginAttempts: 0,
        lockoutUntil: null,
      });

      const result = await authService.login('unlocked@example.com', 'correctpassword');

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe('access-token');
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failedLoginAttempts: 0,
            lockoutUntil: null,
          }),
        })
      );
    });

    it('should reset failed attempts counter on successful login', async () => {
      const userWithFailedAttempts = {
        id: 'user-4',
        email: 'recovery@example.com',
        passwordHash: 'hash123',
        failedLoginAttempts: 3,
        lockoutUntil: null,
        tokenVersion: 0,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(userWithFailedAttempts);
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(true);
      vi.mocked(jwtUtils.generateAccessToken).mockReturnValue('access-token');
      vi.mocked(jwtUtils.generateRefreshToken).mockReturnValue('refresh-token');

      mockPrisma.session.create.mockResolvedValue({
        id: 'session-2',
        userId: 'user-4',
        token: 'refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      });

      mockPrisma.user.update.mockResolvedValue({
        ...userWithFailedAttempts,
        failedLoginAttempts: 0,
      });

      const result = await authService.login('recovery@example.com', 'correctpassword');

      expect(result.success).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failedLoginAttempts: 0,
          }),
        })
      );
    });
  });

  describe('2. Token Management', () => {
    it('should generate new access token with valid refresh token and matching tokenVersion', async () => {
      const mockSession = {
        id: 'session-1',
        userId: 'user-5',
        token: 'refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      const mockUser = {
        id: 'user-5',
        email: 'token@example.com',
        passwordHash: 'hash123',
        failedLoginAttempts: 0,
        lockoutUntil: null,
        tokenVersion: 1,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(jwtUtils.verifyToken).mockReturnValue({ userId: 'user-5', tokenVersion: 1 });
      mockPrisma.session.findUnique.mockResolvedValue(mockSession);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(jwtUtils.generateAccessToken).mockReturnValue('new-access-token');

      const result = await authService.refreshTokens('refresh-token');

      expect(result.accessToken).toBe('new-access-token');
      expect(vi.mocked(jwtUtils.verifyToken)).toHaveBeenCalledWith('refresh-token');
    });

    it('should reject token refresh with mismatched tokenVersion', async () => {
      const mockSession = {
        id: 'session-2',
        userId: 'user-6',
        token: 'old-refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      const mockUser = {
        id: 'user-6',
        email: 'version@example.com',
        passwordHash: 'hash123',
        failedLoginAttempts: 0,
        lockoutUntil: null,
        tokenVersion: 2, // User logged out, version incremented
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(jwtUtils.verifyToken).mockReturnValue({ userId: 'user-6', tokenVersion: 1 });
      mockPrisma.session.findUnique.mockResolvedValue(mockSession);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(authService.refreshTokens('old-refresh-token')).rejects.toThrow('TOKEN_VERSION_MISMATCH');
    });

    it('should increment tokenVersion and delete session on logout', async () => {
      const mockSession = {
        id: 'session-3',
        userId: 'user-7',
        token: 'refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      const mockUser = {
        id: 'user-7',
        email: 'logout@example.com',
        passwordHash: 'hash123',
        failedLoginAttempts: 0,
        lockoutUntil: null,
        tokenVersion: 5,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(jwtUtils.verifyToken).mockReturnValue({ userId: 'user-7', tokenVersion: 5 });
      mockPrisma.session.findUnique.mockResolvedValue(mockSession);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        tokenVersion: 6,
      });
      mockPrisma.session.delete.mockResolvedValue(mockSession);

      await authService.logout('refresh-token');

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-7' },
          data: { tokenVersion: 6 },
        })
      );
      expect(mockPrisma.session.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { token: 'refresh-token' },
        })
      );
    });
  });

  describe('3. Session Management', () => {
    it('should correctly identify expired sessions', async () => {
      const expiredSession = {
        id: 'session-4',
        userId: 'user-8',
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      };

      mockPrisma.session.findUnique.mockResolvedValue(expiredSession);

      const result = await authService.validateSession('expired-token');

      expect(result).toBeNull();
    });

    it('should return null for non-existent sessions', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(null);

      const result = await authService.validateSession('non-existent-token');

      expect(result).toBeNull();
    });

    it('should return valid session for active session token', async () => {
      const validSession = {
        id: 'session-5',
        userId: 'user-9',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // Expires in 6 days
        createdAt: new Date(),
      };

      mockPrisma.session.findUnique.mockResolvedValue(validSession);

      const result = await authService.validateSession('valid-token');

      expect(result).toEqual(validSession);
    });
  });

  describe('4. Edge Cases', () => {
    it('should return INVALID_CREDENTIALS error for invalid credentials', async () => {
      const testUser = {
        id: 'user-10',
        email: 'edge@example.com',
        passwordHash: 'hash123',
        failedLoginAttempts: 0,
        lockoutUntil: null,
        tokenVersion: 0,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(testUser);
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(false);
      mockPrisma.user.update.mockResolvedValue({
        ...testUser,
        failedLoginAttempts: 1,
      });

      const result = await authService.login('edge@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toContain('INVALID_CREDENTIALS');
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failedLoginAttempts: 1,
          }),
        })
      );
    });

    it('should return USER_NOT_FOUND error when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await authService.login('nonexistent@example.com', 'password');

      expect(result.success).toBe(false);
      expect(result.error).toContain('USER_NOT_FOUND');
    });

    it('should successfully login with valid credentials and reset failed attempts', async () => {
      const testUser = {
        id: 'user-11',
        email: 'success@example.com',
        passwordHash: 'hash123',
        failedLoginAttempts: 2,
        lockoutUntil: null,
        tokenVersion: 0,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(testUser);
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(true);
      vi.mocked(jwtUtils.generateAccessToken).mockReturnValue('access-token');
      vi.mocked(jwtUtils.generateRefreshToken).mockReturnValue('refresh-token');

      mockPrisma.session.create.mockResolvedValue({
        id: 'session-6',
        userId: 'user-11',
        token: 'refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      });

      mockPrisma.user.update.mockResolvedValue({
        ...testUser,
        failedLoginAttempts: 0,
      });

      const result = await authService.login('success@example.com', 'correctpassword');

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failedLoginAttempts: 0,
          }),
        })
      );
    });
  });
});
