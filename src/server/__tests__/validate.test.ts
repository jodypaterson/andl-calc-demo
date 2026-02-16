import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

// Mock Express request/response/next
function createMocks() {
  const req = {
    body: {},
    params: {},
    query: {}
  } as Request;
  
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis()
  } as unknown as Response;
  
  const next = vi.fn() as NextFunction;
  
  return { req, res, next };
}

describe('validate middleware', () => {
  describe('body validation', () => {
    it('should allow valid request body to pass', () => {
      const schema = z.object({
        username: z.string().min(3),
        password: z.string().min(8)
      });
      
      const { req, res, next } = createMocks();
      req.body = { username: 'testuser', password: 'password123' };
      
      const middleware = validate({ body: schema });
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should return 400 with VALIDATION_ERROR for invalid body', () => {
      const schema = z.object({
        username: z.string().min(3),
        password: z.string().min(8)
      });
      
      const { req, res, next } = createMocks();
      req.body = { username: 'ab', password: 'short' }; // Too short
      
      const middleware = validate({ body: schema });
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            message: expect.any(String),
            details: expect.any(Array)
          })
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return detailed error for missing required field', () => {
      const schema = z.object({
        username: z.string(),
        password: z.string()
      });
      
      const { req, res, next } = createMocks();
      req.body = { username: 'testuser' }; // Missing password
      
      const middleware = validate({ body: schema });
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      const errorResponse = (res.json as any).mock.calls[0][0];
      expect(errorResponse.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['password']
          })
        ])
      );
    });
    
    it('should reject extra fields in strict mode', () => {
      const schema = z.object({
        username: z.string()
      }).strict(); // Strict mode - no extra properties
      
      const { req, res, next } = createMocks();
      req.body = { username: 'testuser', extraField: 'unexpected' };
      
      const middleware = validate({ body: schema });
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      const errorResponse = (res.json as any).mock.calls[0][0];
      expect(errorResponse.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'unrecognized_keys'
          })
        ])
      );
    });
  });
  
  describe('params validation', () => {
    it('should validate request params', () => {
      const schema = z.object({
        id: z.string().uuid()
      });
      
      const { req, res, next } = createMocks();
      req.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      
      const middleware = validate({ params: schema });
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should return 400 for invalid params', () => {
      const schema = z.object({
        id: z.string().uuid()
      });
      
      const { req, res, next } = createMocks();
      req.params = { id: 'not-a-uuid' };
      
      const middleware = validate({ params: schema });
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR'
          })
        })
      );
    });
  });
  
  describe('query validation', () => {
    it('should validate request query', () => {
      const schema = z.object({
        page: z.string().regex(/^\d+$/),
        limit: z.string().regex(/^\d+$/)
      });
      
      const { req, res, next } = createMocks();
      req.query = { page: '1', limit: '10' };
      
      const middleware = validate({ query: schema });
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should return 400 for invalid query', () => {
      const schema = z.object({
        page: z.string().regex(/^\d+$/)
      });
      
      const { req, res, next } = createMocks();
      req.query = { page: 'abc' }; // Not a number
      
      const middleware = validate({ query: schema });
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
  
  describe('multiple source validation', () => {
    it('should validate all sources when multiple schemas provided', () => {
      const bodySchema = z.object({ name: z.string() });
      const paramsSchema = z.object({ id: z.string() });
      const querySchema = z.object({ format: z.string() });
      
      const { req, res, next } = createMocks();
      req.body = { name: 'test' };
      req.params = { id: '123' };
      req.query = { format: 'json' };
      
      const middleware = validate({ 
        body: bodySchema, 
        params: paramsSchema, 
        query: querySchema 
      });
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should fail if any source validation fails', () => {
      const bodySchema = z.object({ name: z.string() });
      const paramsSchema = z.object({ id: z.string().uuid() });
      
      const { req, res, next } = createMocks();
      req.body = { name: 'test' }; // Valid
      req.params = { id: 'invalid-uuid' }; // Invalid
      
      const middleware = validate({ 
        body: bodySchema, 
        params: paramsSchema
      });
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('edge cases', () => {
    it('should pass through when no schemas provided', () => {
      const { req, res, next } = createMocks();
      
      const middleware = validate();
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should call next with error for unexpected exceptions', () => {
      const faultySchema = {
        safeParse: () => { throw new Error('Unexpected error'); }
      } as any;
      
      const { req, res, next } = createMocks();
      req.body = {};
      
      const middleware = validate({ body: faultySchema });
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
