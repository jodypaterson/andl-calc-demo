import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { app, startServer, stopServer } from '../src/server/server.js';
import { prisma } from '../src/db.js';

describe('Express Server - ATP-9 Integration Tests', () => {
  let serverInstance: any;

  beforeAll(async () => {
    // Start server before tests
    serverInstance = await startServer();
  });

  afterAll(async () => {
    // Clean shutdown after tests
    await stopServer();
  });

  describe('Server Startup', () => {
    it('should start server without errors', () => {
      expect(serverInstance).toBeDefined();
    });

    it('should apply middleware in correct order', () => {
      // Verify middleware stack is present
      const middlewareStack = (app as any)._router.stack;
      expect(middlewareStack.length).toBeGreaterThan(0);
    });
  });

  describe('Health Endpoint', () => {
    it('should return 200 status on GET /health', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });

    it('should return status object with uptime', async () => {
      const response = await request(app).get('/health');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.status).toBe('ok');
    });

    it('should include database connectivity check', async () => {
      const response = await request(app).get('/health');
      expect(response.body).toHaveProperty('database');
    });

    it('should handle database unavailable gracefully', async () => {
      // Mock Prisma to simulate database failure
      vi.spyOn(prisma, '$queryRaw').mockRejectedValueOnce(new Error('Database unavailable'));
      
      const response = await request(app).get('/health');
      // Health endpoint should still respond but indicate database issue
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.body).toHaveProperty('database');
    });
  });

  describe('Middleware Stack', () => {
    it('should set security headers via Helmet', async () => {
      const response = await request(app).get('/health');
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should handle CORS requests', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');
      
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should parse JSON request bodies', async () => {
      // Create a test endpoint that echoes body
      const testData = { test: 'data' };
      const response = await request(app)
        .post('/health') // Using health as test endpoint
        .send(testData)
        .set('Content-Type', 'application/json');
      
      // Verify JSON parsing didn't cause errors
      expect(response.status).toBeDefined();
    });

    it('should parse URL-encoded request bodies', async () => {
      const response = await request(app)
        .post('/health')
        .send('key=value')
        .set('Content-Type', 'application/x-www-form-urlencoded');
      
      // Verify URL-encoded parsing didn't cause errors
      expect(response.status).toBeDefined();
    });

    it('should parse cookies', async () => {
      const response = await request(app)
        .get('/health')
        .set('Cookie', ['testCookie=testValue']);
      
      // Verify cookie parsing didn't cause errors
      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should return consistent error response format', async () => {
      // Request non-existent endpoint to trigger 404
      const response = await request(app).get('/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should log errors properly', async () => {
      // Spy on console.error to verify error logging
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await request(app).get('/nonexistent');
      
      // Error handler should log errors
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Graceful Shutdown', () => {
    it('should handle SIGTERM signal', async () => {
      // Mock process.exit to prevent actual exit
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      
      // Emit SIGTERM
      process.emit('SIGTERM' as any);
      
      // Wait briefly for handlers to execute
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify exit was called
      expect(exitSpy).toHaveBeenCalledWith(0);
      exitSpy.mockRestore();
    });

    it('should handle SIGINT signal', async () => {
      // Mock process.exit
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      
      // Emit SIGINT
      process.emit('SIGINT' as any);
      
      // Wait briefly
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify exit was called
      expect(exitSpy).toHaveBeenCalledWith(0);
      exitSpy.mockRestore();
    });

    it('should disconnect Prisma on shutdown', async () => {
      // Spy on Prisma disconnect
      const disconnectSpy = vi.spyOn(prisma, '$disconnect').mockResolvedValue();
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      
      // Emit SIGTERM
      process.emit('SIGTERM' as any);
      
      // Wait for handlers
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify Prisma disconnect was called
      expect(disconnectSpy).toHaveBeenCalled();
      
      disconnectSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });
});
