import rateLimit from 'express-rate-limit';

// Global rate limiter - 100 requests per minute per IP
// Prevents general abuse/DoS attacks
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true, // RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many requests from this IP, please try again later.'
    }
  }
});

// Login rate limiter - 5 attempts per minute per IP
// Prevents brute force password attacks
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many login attempts, please try again later.'
    }
  }
});

// Password change rate limiter - 3 attempts per hour per IP
// Prevents password spraying on authenticated sessions
export const passwordChangeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many password change attempts, please try again later.'
    }
  }
});
