import request from 'supertest';
import { createServer } from '../server.js';
import { prisma } from '../db.js';

const app = createServer();
import jwt from 'jsonwebtoken';
import { DEFAULT_SETTINGS } from '../services/profile.service';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
}

describe('Profile Routes - /api/profile', () => {
  let testUserId: number;
  let testToken: string;

  beforeAll(async () => {
    // Clean up any existing test user and profile
    await prisma.profile.deleteMany({
      where: { user: { email: 'profile-qa-test@example.com' } },
    });
    await prisma.user.deleteMany({
      where: { email: 'profile-qa-test@example.com' },
    });

    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: 'profile-qa-test@example.com',
        passwordHash: 'hashed-password',
        username: 'profile-qa-test-user',
        role: 'USER',
      },
    });

    testUserId = user.id;
    testToken = generateToken(testUserId);
  });

  afterAll(async () => {
    // Cleanup: Delete test profile and user
    await prisma.profile.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  describe('GET /api/profile', () => {
    describe('Authentication', () => {
      it('should return 401 if no token provided', async () => {
        const response = await request(app).get('/api/profile');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
      });

      it('should return 401 if invalid token provided', async () => {
        const response = await request(app)
          .get('/api/profile')
          .set('Authorization', 'Bearer invalid-token');

        expect(response.status).toBe(401);
      });

      it('should return 401 if expired token provided', async () => {
        const expiredToken = jwt.sign({ userId: testUserId }, JWT_SECRET, {
          expiresIn: '0s',
        });

        const response = await request(app)
          .get('/api/profile')
          .set('Authorization', `Bearer ${expiredToken}`);

        expect(response.status).toBe(401);
      });
    });

    describe('Lazy Profile Creation', () => {
      it('should create profile with default settings if profile does not exist', async () => {
        // Ensure no profile exists
        await prisma.profile.deleteMany({ where: { userId: testUserId } });

        const response = await request(app)
          .get('/api/profile')
          .set('Authorization', `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          userId: testUserId,
          displayName: null,
          bio: null,
          avatarUrl: null,
          settings: DEFAULT_SETTINGS,
        });
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('createdAt');
        expect(response.body).toHaveProperty('updatedAt');
      });

      it('should return existing profile if it exists', async () => {
        // Ensure profile exists
        const existingProfile = await prisma.profile.create({
          data: {
            userId: testUserId,
            displayName: 'Test User',
            bio: 'Test bio',
            settings: { theme: 'dark' },
          },
        });

        const response = await request(app)
          .get('/api/profile')
          .set('Authorization', `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          id: existingProfile.id,
          userId: testUserId,
          displayName: 'Test User',
          bio: 'Test bio',
          settings: { theme: 'dark' },
        });

        // Cleanup
        await prisma.profile.delete({ where: { id: existingProfile.id } });
      });
    });
  });

  describe('PUT /api/profile', () => {
    describe('Authentication', () => {
      it('should return 401 if no token provided', async () => {
        const response = await request(app)
          .put('/api/profile')
          .send({ displayName: 'Test' });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
      });

      it('should return 401 if invalid token provided', async () => {
        const response = await request(app)
          .put('/api/profile')
          .set('Authorization', 'Bearer invalid-token')
          .send({ displayName: 'Test' });

        expect(response.status).toBe(401);
      });
    });

    describe('Upsert Behavior', () => {
      beforeEach(async () => {
        // Clean up profile before each test in this group
        await prisma.profile.deleteMany({ where: { userId: testUserId } });
      });

      it('should create profile if it does not exist', async () => {
        const response = await request(app)
          .put('/api/profile')
          .set('Authorization', `Bearer ${testToken}`)
          .send({
            displayName: 'New User',
            bio: 'New bio',
            avatarUrl: 'https://example.com/avatar.png',
          });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          userId: testUserId,
          displayName: 'New User',
          bio: 'New bio',
          avatarUrl: 'https://example.com/avatar.png',
        });
        expect(response.body.settings).toEqual(DEFAULT_SETTINGS);
      });

      it('should update existing profile', async () => {
        // Create initial profile
        await prisma.profile.create({
          data: {
            userId: testUserId,
            displayName: 'Old Name',
            bio: 'Old bio',
          },
        });

        const response = await request(app)
          .put('/api/profile')
          .set('Authorization', `Bearer ${testToken}`)
          .send({
            displayName: 'Updated Name',
          });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          userId: testUserId,
          displayName: 'Updated Name',
          bio: 'Old bio', // Should preserve existing bio
        });
      });

      it('should not overwrite unspecified fields', async () => {
        // Create initial profile with all fields
        await prisma.profile.create({
          data: {
            userId: testUserId,
            displayName: 'Full Name',
            bio: 'Full bio',
            avatarUrl: 'https://example.com/old.png',
            settings: { theme: 'dark', precision: 5 },
          },
        });

        // Update only displayName
        const response = await request(app)
          .put('/api/profile')
          .set('Authorization', `Bearer ${testToken}`)
          .send({
            displayName: 'New Name',
          });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          displayName: 'New Name',
          bio: 'Full bio', // Preserved
          avatarUrl: 'https://example.com/old.png', // Preserved
          settings: { theme: 'dark', precision: 5 }, // Preserved
        });
      });
    });

    describe('Validation', () => {
      beforeEach(async () => {
        // Ensure profile exists for validation tests
        await prisma.profile.deleteMany({ where: { userId: testUserId } });
        await prisma.profile.create({
          data: { userId: testUserId },
        });
      });

      it('should reject empty displayName', async () => {
        const response = await request(app)
          .put('/api/profile')
          .set('Authorization', `Bearer ${testToken}`)
          .send({ displayName: '' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Validation failed');
        expect(response.body.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: 'Display name cannot be empty',
            }),
          ])
        );
      });

      it('should trim whitespace from displayName', async () => {
        const response = await request(app)
          .put('/api/profile')
          .set('Authorization', `Bearer ${testToken}`)
          .send({ displayName: '  Whitespace Test  ' });

        expect(response.status).toBe(200);
        expect(response.body.displayName).toBe('Whitespace Test');
      });

      it('should reject displayName longer than 100 characters', async () => {
        const longName = 'a'.repeat(101);

        const response = await request(app)
          .put('/api/profile')
          .set('Authorization', `Bearer ${testToken}`)
          .send({ displayName: longName });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Validation failed');
        expect(response.body.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: 'Display name must be less than 100 characters',
            }),
          ])
        );
      });

      it('should reject bio longer than 500 characters', async () => {
        const longBio = 'a'.repeat(501);

        const response = await request(app)
          .put('/api/profile')
          .set('Authorization', `Bearer ${testToken}`)
          .send({ bio: longBio });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Validation failed');
        expect(response.body.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: 'Bio must be less than 500 characters',
            }),
          ])
        );
      });

      it('should reject invalid avatarUrl format', async () => {
        const response = await request(app)
          .put('/api/profile')
          .set('Authorization', `Bearer ${testToken}`)
          .send({ avatarUrl: 'not-a-url' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Validation failed');
        expect(response.body.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: 'Avatar URL must be a valid URL',
            }),
          ])
        );
      });

      it('should accept valid avatarUrl', async () => {
        const response = await request(app)
          .put('/api/profile')
          .set('Authorization', `Bearer ${testToken}`)
          .send({ avatarUrl: 'https://example.com/avatar.png' });

        expect(response.status).toBe(200);
        expect(response.body.avatarUrl).toBe('https://example.com/avatar.png');
      });
    });

    describe('Settings Management', () => {
      beforeEach(async () => {
        await prisma.profile.deleteMany({ where: { userId: testUserId } });
      });

      it('should use default settings when creating new profile without settings', async () => {
        const response = await request(app)
          .put('/api/profile')
          .set('Authorization', `Bearer ${testToken}`)
          .send({ displayName: 'Test User' });

        expect(response.status).toBe(200);
        expect(response.body.settings).toEqual(DEFAULT_SETTINGS);
      });

      it('should allow overriding default settings', async () => {
        const customSettings = {
          calculatorMode: 'RAD',
          precision: 5,
          theme: 'dark',
        };

        const response = await request(app)
          .put('/api/profile')
          .set('Authorization', `Bearer ${testToken}`)
          .send({ settings: customSettings });

        expect(response.status).toBe(200);
        expect(response.body.settings).toEqual(customSettings);
      });

      it('should preserve existing settings when updating other fields', async () => {
        // Create profile with custom settings
        await prisma.profile.create({
          data: {
            userId: testUserId,
            settings: { theme: 'dark', precision: 5 },
          },
        });

        // Update displayName only
        const response = await request(app)
          .put('/api/profile')
          .set('Authorization', `Bearer ${testToken}`)
          .send({ displayName: 'New Name' });

        expect(response.status).toBe(200);
        expect(response.body.settings).toEqual({ theme: 'dark', precision: 5 });
      });
    });
  });
});
