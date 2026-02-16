import { describe, it, expect } from 'vitest';
import { createValidUser, createAdminUser } from '../fixtures/index.js';

describe('Sample Test Suite', () => {
  describe('User Fixtures', () => {
    it('should create a valid user with default role', () => {
      const user = createValidUser();
      
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user.role).toBe('user');
    });

    it('should create an admin user', () => {
      const admin = createAdminUser();
      
      expect(admin.role).toBe('admin');
    });

    it('should allow property overrides', () => {
      const user = createValidUser({ email: 'test@example.com' });
      
      expect(user.email).toBe('test@example.com');
    });
  });
});
