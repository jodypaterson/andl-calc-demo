// tests/server/auth.routes.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';

// CRITICAL: Mock JWT utilities BEFORE importing anything that uses them
vi.mock('../../src/server/utils/jwt.js', () => ({
  verifyToken: vi.fn().mockResolvedValue({ userId: 'test-user-id' }),
  generateAccessToken: vi.fn().mockReturnValue('mock-access-token'),
  generateRefreshToken: vi.fn().mockReturnValue('mock-refresh-token'),
}));

// Mock Prisma client to avoid database dependency
vi.mock('../../src/db.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    session: {
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

// Mock password utilities
vi.mock('../../src/server/utils/password.js', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed-password'),
  verifyPassword: vi.fn().mockResolvedValue(true),
}));

// Now import the routes after all mocks are set up
import authRoutes from '../../src/server/routes/auth.routes.js';
import { prisma } from '../../src/db.js';
import cookieParser from 'cookie-parser';

describe('Auth Routes Integration Tests', () => {
  let app: Express;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Create fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/auth', authRoutes);

    // Setup default mock responses
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User',
      password_hash: 'hashed-password',
      failed_login_attempts: 0,
      locked_until: null,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  describe('POST /api/auth/login', () => {
    describe('Happy Path', () => {
      it('should return 200 with token and user for valid credentials', async () => {
        vi.mocked(prisma.session.create).mockResolvedValue({
          id: 'session-id',
          userId: 'test-user-id',
          token: 'mock-refresh-token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        });

        const response = await request(app)
          .post('/api/auth/login')
          .send({ username: 'testuser', password: 'password123' })
          .expect(200);

        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.email).toBe('test@example.com');
        expect(typeof response.body.token).toBe('string');
      });

      it('should set httpOnly refresh token cookie', async () => {
        vi.mocked(prisma.session.create).mockResolvedValue({
          id: 'session-id',
          userId: 'test-user-id',
          token: 'mock-refresh-token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        });

        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'password123' });

        const cookies = response.headers['set-cookie'];
        expect(cookies).toBeDefined();
        expect(Array.isArray(cookies)).toBe(true);
        const refreshCookie = (cookies as string[]).find((c: string) => c.includes('refreshToken'));
        expect(refreshCookie).toBeDefined();
        expect(refreshCookie).toContain('HttpOnly');
      });
    });

    describe('Error Cases', () => {
      it('should return 401 for invalid credentials', async () => {
        // Mock password verification failure
        const { verifyPassword } = await import('../../src/server/utils/password.js');
        vi.mocked(verifyPassword).mockResolvedValue(false);

        const response = await request(app)
          .post('/api/auth/login')
          .send({ username: 'testuser', password: 'wrongpassword' })
          .expect(401);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Invalid credentials');
      });

      it('should return 400 for missing email', async () => {
        await request(app)
          .post('/api/auth/login')
          .send({ password: 'password123' })
          .expect(400);
      });

      it('should return 400 for missing password', async () => {
        await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com' })
          .expect(400);
      });

      it('should return 401 for non-existent user', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'nonexistent@example.com', password: 'password123' })
          .expect(401);

        expect(response.body.error).toContain('Invalid credentials');
      });
    });

    describe('Response Structure', () => {
      it('should return valid JSON response', async () => {
        vi.mocked(prisma.session.create).mockResolvedValue({
          id: 'session-id',
          userId: 'test-user-id',
          token: 'mock-refresh-token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        });

        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'password123' })
          .expect('Content-Type', /json/);

        expect(() => JSON.parse(JSON.stringify(response.body))).not.toThrow();
      });
    });

    describe('Security', () => {
      it('should set SameSite attribute on refresh token cookie', async () => {
        vi.mocked(prisma.session.create).mockResolvedValue({
          id: 'session-id',
          userId: 'test-user-id',
          token: 'mock-refresh-token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        });

        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'password123' });

        const cookies = response.headers['set-cookie'] as string[];
        const refreshCookie = cookies?.find((c: string) => c.includes('refreshToken'));
        expect(refreshCookie).toBeDefined();
        expect(refreshCookie).toMatch(/SameSite=(Strict|Lax)/);
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    describe('Happy Path', () => {
      it('should return 204 for valid token', async () => {
        const { verifyToken } = await import('../../src/server/utils/jwt.js');
        vi.mocked(verifyToken).mockResolvedValue({ userId: 'test-user-id' });
        vi.mocked(prisma.session.delete).mockResolvedValue({
          id: 'session-id',
          userId: 'test-user-id',
          token: 'token',
          expiresAt: new Date(),
          createdAt: new Date(),
        });

        await request(app)
          .post('/api/auth/logout')
          .set('Authorization', 'Bearer valid-token')
          .expect(204);
      });

      it('should clear refresh token cookie', async () => {
        const { verifyToken } = await import('../../src/server/utils/jwt.js');
        vi.mocked(verifyToken).mockResolvedValue({ userId: 'test-user-id' });
        vi.mocked(prisma.session.delete).mockResolvedValue({
          id: 'session-id',
          userId: 'test-user-id',
          token: 'token',
          expiresAt: new Date(),
          createdAt: new Date(),
        });

        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', 'Bearer valid-token');

        const cookies = response.headers['set-cookie'] as string[];
        expect(cookies).toBeDefined();
        const refreshCookie = cookies?.find((c: string) => c.includes('refreshToken'));
        expect(refreshCookie).toBeDefined();
        expect(refreshCookie).toContain('Max-Age=0');
      });
    });

    describe('Error Cases', () => {
      it('should return 401 for missing token', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .expect(401);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('No token provided');
      });

      it('should return 401 for empty Authorization header', async () => {
        await request(app)
          .post('/api/auth/logout')
          .set('Authorization', '')
          .expect(401);
      });
    });
  });

  describe('POST /api/auth/refresh', () => {
    describe('Happy Path', () => {
      it('should return new token for valid refresh token', async () => {
        vi.mocked(prisma.session.findUnique).mockResolvedValue({
          id: 'session-id',
          userId: 'test-user-id',
          token: 'valid-refresh-token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        });
        vi.mocked(prisma.session.delete).mockResolvedValue({
          id: 'session-id',
          userId: 'test-user-id',
          token: 'token',
          expiresAt: new Date(),
          createdAt: new Date(),
        });
        vi.mocked(prisma.session.create).mockResolvedValue({
          id: 'new-session-id',
          userId: 'test-user-id',
          token: 'new-refresh-token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        });

        const response = await request(app)
          .post('/api/auth/refresh')
          .set('Cookie', 'refreshToken=valid-refresh-token')
          .expect(200);

        expect(response.body).toHaveProperty('token');
        expect(typeof response.body.token).toBe('string');
      });

      it('should accept refresh token from Authorization header', async () => {
        vi.mocked(prisma.session.findUnique).mockResolvedValue({
          id: 'session-id',
          userId: 'test-user-id',
          token: 'valid-refresh-token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        });
        vi.mocked(prisma.session.delete).mockResolvedValue({
          id: 'session-id',
          userId: 'test-user-id',
          token: 'token',
          expiresAt: new Date(),
          createdAt: new Date(),
        });
        vi.mocked(prisma.session.create).mockResolvedValue({
          id: 'new-session-id',
          userId: 'test-user-id',
          token: 'new-refresh-token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        });

        const response = await request(app)
          .post('/api/auth/refresh')
          .set('Authorization', 'Bearer valid-refresh-token')
          .expect(200);

        expect(response.body).toHaveProperty('token');
      });
    });

    describe('Error Cases', () => {
      it('should return 401 for missing refresh token', async () => {
        const response = await request(app)
          .post('/api/auth/refresh')
          .expect(401);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('No refresh token provided');
      });

      it('should return 401 for invalid refresh token', async () => {
        vi.mocked(prisma.session.findUnique).mockResolvedValue(null);

        await request(app)
          .post('/api/auth/refresh')
          .set('Cookie', 'refreshToken=invalid-token')
          .expect(401);
      });

      it('should return 401 for expired refresh token', async () => {
        vi.mocked(prisma.session.findUnique).mockResolvedValue({
          id: 'session-id',
          userId: 'test-user-id',
          token: 'expired-token',
          expiresAt: new Date(Date.now() - 1000), // Expired
          createdAt: new Date(),
        });

        await request(app)
          .post('/api/auth/refresh')
          .set('Cookie', 'refreshToken=expired-token')
          .expect(401);
      });
    });

    describe('Response Structure', () => {
      it('should return valid JSON response', async () => {
        vi.mocked(prisma.session.findUnique).mockResolvedValue({
          id: 'session-id',
          userId: 'test-user-id',
          token: 'valid-refresh-token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        });
        vi.mocked(prisma.session.delete).mockResolvedValue({
          id: 'session-id',
          userId: 'test-user-id',
          token: 'token',
          expiresAt: new Date(),
          createdAt: new Date(),
        });
        vi.mocked(prisma.session.create).mockResolvedValue({
          id: 'new-session-id',
          userId: 'test-user-id',
          token: 'new-refresh-token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        });

        await request(app)
          .post('/api/auth/refresh')
          .set('Cookie', 'refreshToken=valid-token')
          .expect('Content-Type', /json/);
      });
    });
  });
});
