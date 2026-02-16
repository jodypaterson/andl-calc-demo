/**
 * Test fixtures for authentication service tests.
 * Provides reusable test data for users, credentials, and tokens.
 */

import type { User } from '@prisma/client';

/**
 * Valid user fixture with proper structure
 */
export const validUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  // Hashed version of 'password123'
  passwordHash: '$2b$10$YourHashedPasswordHere',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  failedLoginAttempts: 0,
  lockoutUntil: null,
  tokenVersion: 1
};

/**
 * Valid login credentials that match validUser
 */
export const validCredentials = {
  email: 'test@example.com',
  password: 'password123'
};

/**
 * Invalid credentials with correct email but wrong password
 */
export const invalidPasswordCredentials = {
  email: 'test@example.com',
  password: 'wrongpassword'
};

/**
 * Credentials for non-existent user
 */
export const nonExistentUserCredentials = {
  email: 'nonexistent@example.com',
  password: 'password123'
};

/**
 * User fixture with account locked
 */
export const lockedUser: User = {
  ...validUser,
  id: 2,
  email: 'locked@example.com',
  failedLoginAttempts: 5,
  lockoutUntil: new Date(Date.now() + 15 * 60 * 1000) // Locked for 15 minutes
};

/**
 * User fixture approaching lockout threshold
 */
export const userNearLockout: User = {
  ...validUser,
  id: 3,
  email: 'nearlocked@example.com',
  failedLoginAttempts: 4 // One attempt away from lockout
};

/**
 * Mock JWT tokens for testing
 */
export const mockTokens = {
  validAccessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6InVzZXIiLCJpYXQiOjE2MTYyMzkwMjIsImV4cCI6OTk5OTk5OTk5OX0.test',
  validRefreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6InVzZXIiLCJpYXQiOjE2MTYyMzkwMjIsImV4cCI6OTk5OTk5OTk5OX0.refresh',
  expiredToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6InVzZXIiLCJpYXQiOjE2MTYyMzkwMjIsImV4cCI6MTYxNjIzOTAyMn0.expired',
  malformedToken: 'not.a.valid.jwt.token',
  invalidSignatureToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6InVzZXIifQ.invalidsignature'
};

/**
 * Mock token payload
 */
export const mockTokenPayload = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  role: 'user',
  tokenVersion: 1
};
