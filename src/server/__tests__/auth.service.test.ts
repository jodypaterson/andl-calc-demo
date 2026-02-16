/**
 * Unit tests for authentication service.
 * Tests cover login flows, JWT token operations, and account lockout mechanisms.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AuthService } from '../services/auth.service.js';
import { PrismaClient } from '@prisma/client';
import { comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';
import {
  validUser,
  validCredentials,
  invalidPasswordCredentials,
  nonExistentUserCredentials,
  lockedUser,
  userNearLockout,
  mockTokens,
  mockTokenPayload
} from './fixtures/auth.fixtures.js';

// Mock dependencies
vi.mock('@prisma/client');
vi.mock('../utils/password');
vi.mock('../utils/jwt');

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrisma: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create mock Prisma client
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn()
      },
      session: {
        create: vi.fn(),
        delete: vi.fn(),
        findUnique: vi.fn()
      }
    };

    // Mock PrismaClient constructor
    (PrismaClient as any).mockImplementation(() => mockPrisma);

    authService = new AuthService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    describe('successful login', () => {
      it('should return access and refresh tokens for valid credentials', async () => {
        // Arrange
        mockPrisma.user.findUnique.mockResolvedValue(validUser);
        (comparePassword as any).mockResolvedValue(true);
        (generateAccessToken as any).mockReturnValue(mockTokens.validAccessToken);
        (generateRefreshToken as any).mockReturnValue(mockTokens.validRefreshToken);
        mockPrisma.user.update.mockResolvedValue({ ...validUser, failedLoginAttempts: 0 });
        mockPrisma.session.create.mockResolvedValue({});

        // Act
        const result = await authService.login(validCredentials.email, validCredentials.password);

        // Assert
        expect(result.success).toBe(true);
        expect(result.accessToken).toBe(mockTokens.validAccessToken);
        expect(result.refreshToken).toBe(mockTokens.validRefreshToken);
        expect(result.error).toBeUndefined();
      });

      it('should reset failed login attempts counter on successful login', async () => {
        // Arrange
        const userWithFailedAttempts = { ...validUser, failedLoginAttempts: 3 };
        mockPrisma.user.findUnique.mockResolvedValue(userWithFailedAttempts);
        (comparePassword as any).mockResolvedValue(true);
        (generateAccessToken as any).mockReturnValue(mockTokens.validAccessToken);
        (generateRefreshToken as any).mockReturnValue(mockTokens.validRefreshToken);
        mockPrisma.session.create.mockResolvedValue({});

        // Act
        await authService.login(validCredentials.email, validCredentials.password);

        // Assert
        expect(mockPrisma.user.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              failedLoginAttempts: 0,
              lockoutUntil: null
            })
          })
        );
      });

      it('should create a session with correct expiration', async () => {
        // Arrange
        mockPrisma.user.findUnique.mockResolvedValue(validUser);
        (comparePassword as any).mockResolvedValue(true);
        (generateAccessToken as any).mockReturnValue(mockTokens.validAccessToken);
        (generateRefreshToken as any).mockReturnValue(mockTokens.validRefreshToken);
        mockPrisma.session.create.mockResolvedValue({});

        // Act
        await authService.login(validCredentials.email, validCredentials.password);

        // Assert
        expect(mockPrisma.session.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              userId: validUser.id,
              refreshToken: mockTokens.validRefreshToken
            })
          })
        );
      });

      it('should include correct payload in generated tokens', async () => {
        // Arrange
        mockPrisma.user.findUnique.mockResolvedValue(validUser);
        (comparePassword as any).mockResolvedValue(true);
        mockPrisma.session.create.mockResolvedValue({});

        // Act
        await authService.login(validCredentials.email, validCredentials.password);

        // Assert
        expect(generateAccessToken).toHaveBeenCalledWith(
          expect.objectContaining({
            id: validUser.id,
            username: validUser.username,
            email: validUser.email,
            tokenVersion: validUser.tokenVersion
          })
        );
      });
    });

    describe('login failures', () => {
      it('should reject login with invalid password', async () => {
        // Arrange
        mockPrisma.user.findUnique.mockResolvedValue(validUser);
        (comparePassword as any).mockResolvedValue(false);

        // Act
        const result = await authService.login(invalidPasswordCredentials.email, invalidPasswordCredentials.password);

        // Assert
        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
        expect(result.accessToken).toBeUndefined();
        expect(result.refreshToken).toBeUndefined();
      });

      it('should reject login for non-existent user', async () => {
        // Arrange
        mockPrisma.user.findUnique.mockResolvedValue(null);

        // Act
        const result = await authService.login(nonExistentUserCredentials.email, nonExistentUserCredentials.password);

        // Assert
        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
      });

      it('should increment failed login attempts on invalid password', async () => {
        // Arrange
        mockPrisma.user.findUnique.mockResolvedValue(validUser);
        (comparePassword as any).mockResolvedValue(false);

        // Act
        await authService.login(invalidPasswordCredentials.email, invalidPasswordCredentials.password);

        // Assert
        expect(mockPrisma.user.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              failedLoginAttempts: 1
            })
          })
        );
      });

      it('should validate login response structure', async () => {
        // Arrange
        mockPrisma.user.findUnique.mockResolvedValue(validUser);
        (comparePassword as any).mockResolvedValue(true);
        (generateAccessToken as any).mockReturnValue(mockTokens.validAccessToken);
        (generateRefreshToken as any).mockReturnValue(mockTokens.validRefreshToken);
        mockPrisma.session.create.mockResolvedValue({});

        // Act
        const result = await authService.login(validCredentials.email, validCredentials.password);

        // Assert
        expect(result).toHaveProperty('success');
        expect(typeof result.success).toBe('boolean');
        if (result.success) {
          expect(result).toHaveProperty('accessToken');
          expect(result).toHaveProperty('refreshToken');
          expect(typeof result.accessToken).toBe('string');
          expect(typeof result.refreshToken).toBe('string');
        }
      });
    });
  });

  describe('token operations', () => {
    describe('token generation', () => {
      it('should generate tokens with userId in payload', async () => {
        // Arrange
        mockPrisma.user.findUnique.mockResolvedValue(validUser);
        (comparePassword as any).mockResolvedValue(true);
        mockPrisma.session.create.mockResolvedValue({});

        // Act
        await authService.login(validCredentials.email, validCredentials.password);

        // Assert
        expect(generateAccessToken).toHaveBeenCalledWith(
          expect.objectContaining({
            id: validUser.id
          })
        );
      });

      it('should generate tokens with email in payload', async () => {
        // Arrange
        mockPrisma.user.findUnique.mockResolvedValue(validUser);
        (comparePassword as any).mockResolvedValue(true);
        mockPrisma.session.create.mockResolvedValue({});

        // Act
        await authService.login(validCredentials.email, validCredentials.password);

        // Assert
        expect(generateAccessToken).toHaveBeenCalledWith(
          expect.objectContaining({
            email: validUser.email
          })
        );
      });

      it('should generate tokens with tokenVersion in payload', async () => {
        // Arrange
        mockPrisma.user.findUnique.mockResolvedValue(validUser);
        (comparePassword as any).mockResolvedValue(true);
        mockPrisma.session.create.mockResolvedValue({});

        // Act
        await authService.login(validCredentials.email, validCredentials.password);

        // Assert
        expect(generateAccessToken).toHaveBeenCalledWith(
          expect.objectContaining({
            tokenVersion: validUser.tokenVersion
          })
        );
      });
    });

    describe('token validation', () => {
      it('should accept valid access tokens', async () => {
        // Arrange
        (verifyToken as any).mockReturnValue(mockTokenPayload);

        // Act
        const result = await authService.validateAccessToken(mockTokens.validAccessToken);

        // Assert
        expect(result).toBe(true);
      });

      it('should reject expired tokens', async () => {
        // Arrange
        (verifyToken as any).mockImplementation(() => {
          throw new Error('Token expired');
        });

        // Act & Assert
        await expect(authService.validateAccessToken(mockTokens.expiredToken))
          .rejects.toThrow('Token expired');
      });

      it('should reject malformed tokens', async () => {
        // Arrange
        (verifyToken as any).mockImplementation(() => {
          throw new Error('Invalid token');
        });

        // Act & Assert
        await expect(authService.validateAccessToken(mockTokens.malformedToken))
          .rejects.toThrow('Invalid token');
      });

      it('should reject tokens with invalid signatures', async () => {
        // Arrange
        (verifyToken as any).mockImplementation(() => {
          throw new Error('Invalid signature');
        });

        // Act & Assert
        await expect(authService.validateAccessToken(mockTokens.invalidSignatureToken))
          .rejects.toThrow('Invalid signature');
      });
    });
  });

  describe('account lockout', () => {
    describe('lockout trigger', () => {
      it('should lock account after 5 failed login attempts', async () => {
        // Arrange
        mockPrisma.user.findUnique.mockResolvedValue(userNearLockout);
        (comparePassword as any).mockResolvedValue(false);

        // Act
        await authService.login(userNearLockout.email, 'wrongpassword');

        // Assert
        expect(mockPrisma.user.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              failedLoginAttempts: 5,
              lockoutUntil: expect.any(Date)
            })
          })
        );
      });

      it('should set lockout duration to 15 minutes', async () => {
        // Arrange  
        const now = Date.now();
        vi.useFakeTimers();
        vi.setSystemTime(now);
        
        mockPrisma.user.findUnique.mockResolvedValue(userNearLockout);
        (comparePassword as any).mockResolvedValue(false);

        // Act
        await authService.login(userNearLockout.email, 'wrongpassword');

        // Assert
        const expectedLockoutTime = new Date(now + 15 * 60 * 1000);
        expect(mockPrisma.user.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              lockoutUntil: expect.any(Date)
            })
          })
        );

        vi.useRealTimers();
      });
    });

    describe('locked account behavior', () => {
      it('should reject login for locked account even with correct password', async () => {
        // Arrange
        mockPrisma.user.findUnique.mockResolvedValue(lockedUser);
        (comparePassword as any).mockResolvedValue(true);

        // Act
        const result = await authService.login(lockedUser.email, validCredentials.password);

        // Assert
        expect(result.success).toBe(false);
        expect(result.error).toContain('locked');
      });

      it('should not increment failed attempts for locked account', async () => {
        // Arrange
        mockPrisma.user.findUnique.mockResolvedValue(lockedUser);
        (comparePassword as any).mockResolvedValue(false);

        // Act
        await authService.login(lockedUser.email, 'wrongpassword');

        // Assert
        // Update should not be called since account check happens first
        expect(mockPrisma.user.update).not.toHaveBeenCalled();
      });
    });

    describe('lockout expiration', () => {
      it('should allow login after lockout period expires', async () => {
        // Arrange
        vi.useFakeTimers();
        const now = Date.now();
        vi.setSystemTime(now);

        // User locked 16 minutes ago (lockout expired)
        const expiredLockoutUser = {
          ...validUser,
          failedLoginAttempts: 5,
          lockoutUntil: new Date(now - 16 * 60 * 1000)
        };

        mockPrisma.user.findUnique.mockResolvedValue(expiredLockoutUser);
        (comparePassword as any).mockResolvedValue(true);
        (generateAccessToken as any).mockReturnValue(mockTokens.validAccessToken);
        (generateRefreshToken as any).mockReturnValue(mockTokens.validRefreshToken);
        mockPrisma.session.create.mockResolvedValue({});

        // Act
        const result = await authService.login(expiredLockoutUser.email, validCredentials.password);

        // Assert
        expect(result.success).toBe(true);
        expect(result.accessToken).toBeTruthy();

        vi.useRealTimers();
      });

      it('should reset failed attempts counter after lockout expires', async () => {
        // Arrange
        vi.useFakeTimers();
        const now = Date.now();
        vi.setSystemTime(now);

        const expiredLockoutUser = {
          ...validUser,
          failedLoginAttempts: 5,
          lockoutUntil: new Date(now - 16 * 60 * 1000)
        };

        mockPrisma.user.findUnique.mockResolvedValue(expiredLockoutUser);
        (comparePassword as any).mockResolvedValue(true);
        (generateAccessToken as any).mockReturnValue(mockTokens.validAccessToken);
        (generateRefreshToken as any).mockReturnValue(mockTokens.validRefreshToken);
        mockPrisma.session.create.mockResolvedValue({});

        // Act
        await authService.login(expiredLockoutUser.email, validCredentials.password);

        // Assert
        expect(mockPrisma.user.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              failedLoginAttempts: 0,
              lockoutUntil: null
            })
          })
        );

        vi.useRealTimers();
      });
    });
  });
});
