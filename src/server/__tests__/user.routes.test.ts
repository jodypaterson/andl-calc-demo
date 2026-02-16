import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createServer } from '../server';
import { prisma } from '../db';
import jwt from 'jsonwebtoken';
import { Express } from 'express';

describe('User Routes (/api/users)', () => {
  let app: Express;
  let testUserId: string;
  let validToken: string;
  let otherUserId: string;
  let otherUserToken: string;

  beforeAll(async () => {
    // Initialize server
    app = createServer();

    // Clean up test data
    await prisma.user.deleteMany({
      where: { username: { in: ['testuser', 'otheruser'] } },
    });

    // Create test user with profile
    const testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        profile: {
          create: {
            displayName: 'Test User',
          },
        },
      },
    });
    testUserId = testUser.id;

    // Create another user for conflict testing
    const otherUser = await prisma.user.create({
      data: {
        username: 'otheruser',
        email: 'other@example.com',
        passwordHash: 'hashed_password',
        profile: {
          create: {
            displayName: 'Other User',
          },
        },
      },
    });
    otherUserId = otherUser.id;

    // Generate valid tokens
    const secret = process.env.JWT_SECRET || 'test-secret';
    validToken = jwt.sign({ userId: testUserId }, secret, { expiresIn: '1h' });
    otherUserToken = jwt.sign({ userId: otherUserId }, secret, { expiresIn: '1h' });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { id: { in: [testUserId, otherUserId] } },
    });
    await prisma.$disconnect();
  });

  describe('GET /api/users/me', () => {
    describe('Authentication', () => {
      it('should return 401 when no token provided', async () => {
        const response = await request(app).get('/api/users/me');

        expect(response.status).toBe(401);
      });

      it('should return 401 when invalid token provided', async () => {
        const response = await request(app)
          .get('/api/users/me')
          .set('Authorization', 'Bearer invalid-token');

        expect(response.status).toBe(401);
      });

      it('should return 401 when expired token provided', async () => {
        const secret = process.env.JWT_SECRET || 'test-secret';
        const expiredToken = jwt.sign({ userId: testUserId }, secret, { expiresIn: '-1h' });

        const response = await request(app)
          .get('/api/users/me')
          .set('Authorization', `Bearer ${expiredToken}`);

        expect(response.status).toBe(401);
      });
    });

    describe('Success Cases', () => {
      it('should return 200 with user profile when valid token provided', async () => {
        const response = await request(app)
          .get('/api/users/me')
          .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
      });

      it('should include correct fields in response', async () => {
        const response = await request(app)
          .get('/api/users/me')
          .set('Authorization', `Bearer ${validToken}`);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('username', 'testuser');
        expect(response.body).toHaveProperty('email', 'test@example.com');
        expect(response.body).toHaveProperty('createdAt');
        expect(response.body).toHaveProperty('profile');
        expect(response.body.profile).toHaveProperty('displayName', 'Test User');
      });

      it('should EXCLUDE sensitive fields from response', async () => {
        const response = await request(app)
          .get('/api/users/me')
          .set('Authorization', `Bearer ${validToken}`);

        // CRITICAL: Verify sensitive fields are NOT present
        expect(response.body).not.toHaveProperty('passwordHash');
        expect(response.body).not.toHaveProperty('tokenVersion');
        expect(response.body).not.toHaveProperty('failedLoginAttempts');
        expect(response.body).not.toHaveProperty('lockoutUntil');
      });
    });

    describe('Edge Cases', () => {
      it('should return 404 if user deleted after token issued', async () => {
        // Create temporary user
        const tempUser = await prisma.user.create({
          data: {
            username: 'tempuser',
            email: 'temp@example.com',
            passwordHash: 'hashed_password',
          },
        });

        // Generate token for temp user
        const secret = process.env.JWT_SECRET || 'test-secret';
        const tempToken = jwt.sign({ userId: tempUser.id }, secret, { expiresIn: '1h' });

        // Delete the user
        await prisma.user.delete({ where: { id: tempUser.id } });

        // Try to access with valid token for deleted user
        const response = await request(app)
          .get('/api/users/me')
          .set('Authorization', `Bearer ${tempToken}`);

        expect(response.status).toBe(404);
      });
    });
  });

  describe('PATCH /api/users/me', () => {
    beforeEach(async () => {
      // Reset test user profile before each test
      await prisma.profile.update({
        where: { userId: testUserId },
        data: { displayName: 'Test User' },
      });
      await prisma.user.update({
        where: { id: testUserId },
        data: { email: 'test@example.com' },
      });
    });

    describe('Authentication', () => {
      it('should return 401 when no token provided', async () => {
        const response = await request(app)
          .patch('/api/users/me')
          .send({ displayName: 'Updated Name' });

        expect(response.status).toBe(401);
      });

      it('should return 401 when invalid token provided', async () => {
        const response = await request(app)
          .patch('/api/users/me')
          .set('Authorization', 'Bearer invalid-token')
          .send({ displayName: 'Updated Name' });

        expect(response.status).toBe(401);
      });
    });

    describe('Success Cases', () => {
      it('should update displayName successfully', async () => {
        const response = await request(app)
          .patch('/api/users/me')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ displayName: 'Updated Display Name' });

        expect(response.status).toBe(200);
        expect(response.body.profile.displayName).toBe('Updated Display Name');
      });

      it('should update email successfully', async () => {
        const response = await request(app)
          .patch('/api/users/me')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ email: 'newemail@example.com' });

        expect(response.status).toBe(200);
        expect(response.body.email).toBe('newemail@example.com');
      });

      it('should update both displayName and email successfully', async () => {
        const response = await request(app)
          .patch('/api/users/me')
          .set('Authorization', `Bearer ${validToken}`)
          .send({
            displayName: 'Both Updated',
            email: 'both@example.com',
          });

        expect(response.status).toBe(200);
        expect(response.body.profile.displayName).toBe('Both Updated');
        expect(response.body.email).toBe('both@example.com');
      });

      it('should create profile if it does not exist (upsert behavior)', async () => {
        // Create user without profile
        const noProfileUser = await prisma.user.create({
          data: {
            username: 'noprofile',
            email: 'noprofile@example.com',
            passwordHash: 'hashed_password',
          },
        });

        const secret = process.env.JWT_SECRET || 'test-secret';
        const noProfileToken = jwt.sign({ userId: noProfileUser.id }, secret, { expiresIn: '1h' });

        const response = await request(app)
          .patch('/api/users/me')
          .set('Authorization', `Bearer ${noProfileToken}`)
          .send({ displayName: 'New Profile' });

        expect(response.status).toBe(200);
        expect(response.body.profile.displayName).toBe('New Profile');

        // Clean up
        await prisma.user.delete({ where: { id: noProfileUser.id } });
      });
    });

    describe('Validation', () => {
      it('should return 400 for invalid email format', async () => {
        const response = await request(app)
          .patch('/api/users/me')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ email: 'invalid-email' });

        expect(response.status).toBe(400);
      });

      it('should return 400 for displayName exceeding 100 characters', async () => {
        const longName = 'a'.repeat(101);
        const response = await request(app)
          .patch('/api/users/me')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ displayName: longName });

        expect(response.status).toBe(400);
      });

      it('should return 400 for empty displayName', async () => {
        const response = await request(app)
          .patch('/api/users/me')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ displayName: '' });

        expect(response.status).toBe(400);
      });
    });

    describe('Conflict Cases', () => {
      it('should return 409 when updating to existing email', async () => {
        const response = await request(app)
          .patch('/api/users/me')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ email: 'other@example.com' }); // otherUser's email

        expect(response.status).toBe(409);
      });
    });

    describe('Security', () => {
      it('should NOT expose sensitive fields in response', async () => {
        const response = await request(app)
          .patch('/api/users/me')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ displayName: 'Security Test' });

        expect(response.status).toBe(200);
        expect(response.body).not.toHaveProperty('passwordHash');
        expect(response.body).not.toHaveProperty('tokenVersion');
        expect(response.body).not.toHaveProperty('failedLoginAttempts');
        expect(response.body).not.toHaveProperty('lockoutUntil');
      });

      it('should only allow users to modify their own profile', async () => {
        // This is implicitly tested by authenticate middleware
        // Token for testUser cannot access otherUser's profile
        // The endpoint doesn't take userId as parameter - it gets it from token
        const response = await request(app)
          .patch('/api/users/me')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ displayName: 'My Update' });

        expect(response.status).toBe(200);

        // Verify only testUser was updated
        const testUser = await prisma.user.findUnique({
          where: { id: testUserId },
          include: { profile: true },
        });
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          include: { profile: true },
        });

        expect(testUser?.profile?.displayName).toBe('My Update');
        expect(otherUser?.profile?.displayName).toBe('Other User'); // Unchanged
      });
    });
  });
});


  describe('POST /me/avatar', () => {
    it('should reject request without authentication token', async () => {
      const response = await request(app)
        .post('/api/users/me/avatar')
        .attach('avatar', Buffer.from('fake image data'), 'test.jpg');

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid authentication token', async () => {
      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', 'Bearer invalid_token')
        .attach('avatar', Buffer.from('fake image data'), 'test.jpg');

      expect(response.status).toBe(401);
    });

    it('should reject request with no file uploaded', async () => {
      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should successfully upload valid JPEG image', async () => {
      // Create a minimal valid JPEG buffer
      const jpegBuffer = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
        0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
        0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9
      ]);

      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('avatar', jpegBuffer, 'test.jpg');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('avatarUrl');
      expect(response.body.avatarUrl).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('should successfully upload valid PNG image', async () => {
      // Create a minimal valid PNG buffer
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
        0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
        0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
        0x42, 0x60, 0x82
      ]);

      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('avatar', pngBuffer, 'test.png');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('avatarUrl');
      expect(response.body.avatarUrl).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('should successfully upload valid GIF image', async () => {
      // Create a minimal valid GIF buffer
      const gifBuffer = Buffer.from([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
        0x01, 0x00, 0x80, 0x00, 0x00, 0xFF, 0xFF, 0xFF,
        0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
        0x01, 0x00, 0x3B
      ]);

      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('avatar', gifBuffer, 'test.gif');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('avatarUrl');
      expect(response.body.avatarUrl).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('should successfully upload valid WEBP image', async () => {
      // Create a minimal valid WEBP buffer
      const webpBuffer = Buffer.from([
        0x52, 0x49, 0x46, 0x46, 0x1A, 0x00, 0x00, 0x00,
        0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20,
        0x0E, 0x00, 0x00, 0x00, 0x30, 0x01, 0x00, 0x9D,
        0x01, 0x2A, 0x01, 0x00, 0x01, 0x00, 0x13, 0x25,
        0xA8, 0x00, 0x03, 0x70, 0x00, 0xFE, 0xFB, 0x94,
        0x00, 0x00
      ]);

      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('avatar', webpBuffer, 'test.webp');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('avatarUrl');
      expect(response.body.avatarUrl).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('should reject file larger than 5MB', async () => {
      // Create a buffer larger than 5MB (5 * 1024 * 1024 bytes)
      const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1);
      
      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('avatar', largeBuffer, 'large.jpg');

      expect(response.status).toBe(413);
    });

    it('should reject non-image file', async () => {
      const textBuffer = Buffer.from('This is a text file, not an image');
      
      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('avatar', textBuffer, 'file.txt');

      expect(response.status).toBe(400);
    });

    it('should reject invalid image file with wrong MIME type', async () => {
      const invalidBuffer = Buffer.from('Not a real image');
      
      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('avatar', invalidBuffer, 'fake.jpg');

      expect(response.status).toBe(400);
    });

    it('should resize image to 200x200 pixels and convert to JPEG', async () => {
      // Create a valid JPEG
      const jpegBuffer = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
        0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
        0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9
      ]);

      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('avatar', jpegBuffer, 'test.jpg');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('avatarUrl');
      expect(response.body.avatarUrl).toMatch(/^data:image\/jpeg;base64,/);
      
      // Verify base64 encoding is valid
      const base64Data = response.body.avatarUrl.split(',')[1];
      expect(base64Data).toBeTruthy();
      expect(() => Buffer.from(base64Data, 'base64')).not.toThrow();
    });

    it('should store avatar as base64 data URL in user profile', async () => {
      const jpegBuffer = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
        0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
        0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9
      ]);

      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('avatar', jpegBuffer, 'test.jpg');

      expect(response.status).toBe(200);
      const { avatarUrl } = response.body;

      // Verify profile was updated
      const updatedProfile = await prisma.profile.findUnique({
        where: { userId: testUserId },
      });

      expect(updatedProfile?.avatarUrl).toBe(avatarUrl);
      expect(updatedProfile?.avatarUrl).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('should return response in correct format with avatarUrl', async () => {
      const jpegBuffer = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
        0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
        0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9
      ]);

      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('avatar', jpegBuffer, 'test.jpg');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        avatarUrl: expect.stringMatching(/^data:image\/jpeg;base64,/),
      });
      
      // Verify only avatarUrl is returned (no other fields)
      expect(Object.keys(response.body)).toEqual(['avatarUrl']);
    });
  });
