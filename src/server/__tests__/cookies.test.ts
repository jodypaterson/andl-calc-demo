/**
 * Unit tests for cookie management utilities.
 * Tests cover setting, clearing, and retrieving refresh token cookies.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setRefreshTokenCookie, clearRefreshTokenCookie, getRefreshTokenFromCookies } from '../utils/cookies.js';
import type { Request, Response } from 'express';

describe('Cookie Utilities', () => {
  let mockResponse: any;
  let mockRequest: any;

  beforeEach(() => {
    // Mock Express Response object
    mockResponse = {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    };

    // Mock Express Request object
    mockRequest = {
      cookies: {},
    };
  });

  describe('setRefreshTokenCookie', () => {
    it('should set cookie with correct name and token', () => {
      const token = 'test-refresh-token';
      setRefreshTokenCookie(mockResponse, token);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        token,
        expect.any(Object)
      );
    });

    it('should set httpOnly flag', () => {
      const token = 'test-token';
      setRefreshTokenCookie(mockResponse, token);

      const options = mockResponse.cookie.mock.calls[0][2];
      expect(options.httpOnly).toBe(true);
    });

    it('should set secure flag based on NODE_ENV', () => {
      const originalEnv = process.env.NODE_ENV;

      // Test production mode
      process.env.NODE_ENV = 'production';
      setRefreshTokenCookie(mockResponse, 'token');
      let options = mockResponse.cookie.mock.calls[0][2];
      expect(options.secure).toBe(true);

      // Reset mock
      mockResponse.cookie.mockClear();

      // Test development mode
      process.env.NODE_ENV = 'development';
      setRefreshTokenCookie(mockResponse, 'token');
      options = mockResponse.cookie.mock.calls[0][2];
      expect(options.secure).toBe(false);

      // Restore original
      process.env.NODE_ENV = originalEnv;
    });

    it('should set sameSite to strict', () => {
      setRefreshTokenCookie(mockResponse, 'token');
      const options = mockResponse.cookie.mock.calls[0][2];
      expect(options.sameSite).toBe('strict');
    });

    it('should set maxAge to 7 days in milliseconds', () => {
      setRefreshTokenCookie(mockResponse, 'token');
      const options = mockResponse.cookie.mock.calls[0][2];
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      expect(options.maxAge).toBe(sevenDaysInMs);
    });
  });

  describe('clearRefreshTokenCookie', () => {
    it('should clear the refreshToken cookie', () => {
      clearRefreshTokenCookie(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(Object)
      );
    });

    it('should use same options as setRefreshTokenCookie (except maxAge)', () => {
      clearRefreshTokenCookie(mockResponse);

      const options = mockResponse.clearCookie.mock.calls[0][1];
      expect(options.httpOnly).toBe(true);
      expect(options.sameSite).toBe('strict');
      // secure flag should match environment
      expect(typeof options.secure).toBe('boolean');
    });
  });

  describe('getRefreshTokenFromCookies', () => {
    it('should retrieve refresh token from cookies', () => {
      mockRequest.cookies = { refreshToken: 'stored-token-value' };
      const token = getRefreshTokenFromCookies(mockRequest);
      expect(token).toBe('stored-token-value');
    });

    it('should return undefined if cookie is not present', () => {
      mockRequest.cookies = {};
      const token = getRefreshTokenFromCookies(mockRequest);
      expect(token).toBeUndefined();
    });

    it('should return undefined if cookies object is missing', () => {
      mockRequest.cookies = undefined;
      const token = getRefreshTokenFromCookies(mockRequest);
      expect(token).toBeUndefined();
    });

    it('should ignore other cookies', () => {
      mockRequest.cookies = {
        otherCookie: 'other-value',
        sessionId: 'session-123',
      };
      const token = getRefreshTokenFromCookies(mockRequest);
      expect(token).toBeUndefined();
    });

    it('should retrieve correct token when multiple cookies present', () => {
      mockRequest.cookies = {
        otherCookie: 'other-value',
        refreshToken: 'correct-token',
        sessionId: 'session-123',
      };
      const token = getRefreshTokenFromCookies(mockRequest);
      expect(token).toBe('correct-token');
    });
  });
});
