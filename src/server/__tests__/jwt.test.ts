/**
 * Unit tests for JWT token generation and verification.
 * Tests cover token creation, validation, expiration, and security scenarios.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../utils/jwt.js';
import type { TokenUser } from '../types/auth.js';
import jwt from 'jsonwebtoken';

// Set required environment variables for testing
process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-characters-long';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

describe('JWT Utilities', () => {
  const testUser: TokenUser = {
    id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid JWT access token', () => {
      const token = generateAccessToken(testUser);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user data in token payload', () => {
      const token = generateAccessToken(testUser);
      const decoded = jwt.decode(token) as any;
      
      expect(decoded.userId).toBe(testUser.id);
      expect(decoded.username).toBe(testUser.username);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.role).toBe(testUser.role);
    });

    it('should include iat and exp claims', () => {
      const token = generateAccessToken(testUser);
      const decoded = jwt.decode(token) as any;
      
      expect(decoded.iat).toBeTruthy();
      expect(decoded.exp).toBeTruthy();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid JWT refresh token', () => {
      const token = generateRefreshToken('user123', 1);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include userId and tokenVersion in payload', () => {
      const token = generateRefreshToken('user456', 2);
      const decoded = jwt.decode(token) as any;
      
      expect(decoded.userId).toBe('user456');
      expect(decoded.tokenVersion).toBe(2);
    });

    it('should include iat and exp claims', () => {
      const token = generateRefreshToken('user123', 1);
      const decoded = jwt.decode(token) as any;
      
      expect(decoded.iat).toBeTruthy();
      expect(decoded.exp).toBeTruthy();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and decode a valid access token', () => {
      const token = generateAccessToken(testUser);
      const payload = verifyAccessToken(token);
      
      expect(payload).toBeTruthy();
      expect(payload?.userId).toBe(testUser.id);
      expect(payload?.username).toBe(testUser.username);
      expect(payload?.email).toBe(testUser.email);
      expect(payload?.role).toBe(testUser.role);
    });

    it('should return null for an expired token', () => {
      // Create a token that expires immediately
      const expiredToken = jwt.sign(
        { userId: 'user123', username: 'test', email: 'test@example.com', role: 'user' },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: '0s' }
      );

      // Wait a tiny bit to ensure it's expired
      return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
        const payload = verifyAccessToken(expiredToken);
        expect(payload).toBeNull();
      });
    });

    it('should return null for a tampered token', () => {
      const token = generateAccessToken(testUser);
      // Tamper with the token by modifying the signature
      const tamperedToken = token.slice(0, -10) + 'TAMPERED12';
      
      const payload = verifyAccessToken(tamperedToken);
      expect(payload).toBeNull();
    });

    it('should return null for a malformed token', () => {
      const payload = verifyAccessToken('not.a.valid.jwt.token');
      expect(payload).toBeNull();
    });

    it('should return null for an empty string', () => {
      const payload = verifyAccessToken('');
      expect(payload).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify and decode a valid refresh token', () => {
      const token = generateRefreshToken('user789', 3);
      const payload = verifyRefreshToken(token);
      
      expect(payload).toBeTruthy();
      expect(payload?.userId).toBe('user789');
      expect(payload?.tokenVersion).toBe(3);
    });

    it('should return null for an expired token', () => {
      const expiredToken = jwt.sign(
        { userId: 'user123', tokenVersion: 1 },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '0s' }
      );

      return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
        const payload = verifyRefreshToken(expiredToken);
        expect(payload).toBeNull();
      });
    });

    it('should return null for a tampered token', () => {
      const token = generateRefreshToken('user123', 1);
      const tamperedToken = token.slice(0, -10) + 'TAMPERED12';
      
      const payload = verifyRefreshToken(tamperedToken);
      expect(payload).toBeNull();
    });

    it('should return null for a malformed token', () => {
      const payload = verifyRefreshToken('invalid');
      expect(payload).toBeNull();
    });

    it('should return null for an empty string', () => {
      const payload = verifyRefreshToken('');
      expect(payload).toBeNull();
    });
  });

  describe('Security: No exception throwing', () => {
    it('verifyAccessToken should not throw on any input', () => {
      expect(() => verifyAccessToken('malformed')).not.toThrow();
      expect(() => verifyAccessToken('')).not.toThrow();
      expect(() => verifyAccessToken('a.b.c')).not.toThrow();
    });

    it('verifyRefreshToken should not throw on any input', () => {
      expect(() => verifyRefreshToken('malformed')).not.toThrow();
      expect(() => verifyRefreshToken('')).not.toThrow();
      expect(() => verifyRefreshToken('a.b.c')).not.toThrow();
    });
  });
});
