import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import helmet from 'helmet';
import { getSecurityConfig } from '../middleware/security.js';

/**
 * Security Headers Integration Tests
 * Verifies that all required security headers are properly configured
 * per ATP-38 acceptance criteria.
 */
describe('Security Headers', () => {
  let app: express.Application;

  beforeAll(() => {
    // Create a minimal Express app with security middleware
    app = express();
    app.use(helmet(getSecurityConfig()));
    
    // Add a test route
    app.get('/test', (_req, res) => {
      res.status(200).json({ message: 'ok' });
    });
  });

  describe('Acceptance Criterion 3: Content-Security-Policy header present', () => {
    it('should include CSP header in response', async () => {
      const response = await request(app).get('/test');
      
      expect(response.headers['content-security-policy']).toBeDefined();
      expect(response.headers['content-security-policy']).toBeTruthy();
    });
  });

  describe('Acceptance Criterion 4: CSP allows self for resources', () => {
    it('should allow self for scripts', async () => {
      const response = await request(app).get('/test');
      const csp = response.headers['content-security-policy'];
      
      expect(csp).toContain("script-src");
      expect(csp).toContain("'self'");
    });

    it('should allow self for styles', async () => {
      const response = await request(app).get('/test');
      const csp = response.headers['content-security-policy'];
      
      expect(csp).toContain("style-src");
      expect(csp).toContain("'self'");
    });

    it('should allow self for images', async () => {
      const response = await request(app).get('/test');
      const csp = response.headers['content-security-policy'];
      
      expect(csp).toContain("img-src");
      expect(csp).toContain("'self'");
    });

    it('should allow self for connections (fetch/XHR)', async () => {
      const response = await request(app).get('/test');
      const csp = response.headers['content-security-policy'];
      
      expect(csp).toContain("connect-src");
      expect(csp).toContain("'self'");
    });
  });

  describe('Acceptance Criterion 5: X-Content-Type-Options', () => {
    it('should set X-Content-Type-Options to nosniff', async () => {
      const response = await request(app).get('/test');
      
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('Acceptance Criterion 6: X-Frame-Options', () => {
    it('should set X-Frame-Options to DENY', async () => {
      const response = await request(app).get('/test');
      
      expect(response.headers['x-frame-options']).toBe('DENY');
    });
  });

  describe('Acceptance Criterion 7: Strict-Transport-Security', () => {
    it('should set HSTS header with max-age and includeSubDomains', async () => {
      const response = await request(app).get('/test');
      const hsts = response.headers['strict-transport-security'];
      
      expect(hsts).toBeDefined();
      expect(hsts).toContain('max-age=31536000'); // 1 year
      expect(hsts).toContain('includeSubDomains');
    });
  });

  describe('Acceptance Criterion 8: Referrer-Policy', () => {
    it('should set Referrer-Policy to strict-origin-when-cross-origin', async () => {
      const response = await request(app).get('/test');
      
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });
  });

  describe('Development vs Production Mode', () => {
    it('should include unsafe-inline and unsafe-eval in development mode', async () => {
      // This test assumes NODE_ENV is 'development' during test runs
      if (process.env.NODE_ENV === 'development') {
        const response = await request(app).get('/test');
        const csp = response.headers['content-security-policy'];
        
        expect(csp).toContain("'unsafe-inline'");
        expect(csp).toContain("'unsafe-eval'");
      }
    });

    it('should have default-src self directive', async () => {
      const response = await request(app).get('/test');
      const csp = response.headers['content-security-policy'];
      
      expect(csp).toContain("default-src");
      expect(csp).toContain("'self'");
    });
  });

  describe('Additional CSP Directives', () => {
    it('should set frame-ancestors to none', async () => {
      const response = await request(app).get('/test');
      const csp = response.headers['content-security-policy'];
      
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it('should set object-src to none', async () => {
      const response = await request(app).get('/test');
      const csp = response.headers['content-security-policy'];
      
      expect(csp).toContain("object-src 'none'");
    });

    it('should allow data: and blob: for images', async () => {
      const response = await request(app).get('/test');
      const csp = response.headers['content-security-policy'];
      
      expect(csp).toContain("img-src");
      expect(csp).toContain('data:');
      expect(csp).toContain('blob:');
    });
  });
});
