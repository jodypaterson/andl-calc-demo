import express from 'express';
import type { Express } from 'express';
import { applySecurityHeaders } from './middleware/security.js';
import { errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import profileRoutes from './routes/profile.routes.js';

/**
 * Create and configure Express application
 * @returns Configured Express app
 */
export function createServer(): Express {
  const app = express();

  // Apply security middleware
  applySecurityHeaders(app);

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/profile', profileRoutes);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}
