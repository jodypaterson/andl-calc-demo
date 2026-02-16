import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../schemas/user.schema.js';
import { getUserById, updateUserProfile } from '../services/user.service.js';
import type { AuthRequest } from '../types/auth.js';
import { upload } from '../middleware/upload.js';
import { processAvatar } from '../utils/image.js';

const router = express.Router();

/**
 * GET /api/users/me
 * Get current user profile
 * Requires authentication
 */
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/users/me
 * Update current user profile
 * Requires authentication
 */
router.patch(
  '/me',
  authenticate,
  validate({ body: updateProfileSchema }),
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.userId;
      const updateData = req.body;

      const updatedUser = await updateUserProfile(userId, updateData);

      res.json({ user: updatedUser });
    } catch (error: any) {
      if (error.status === 409) {
        return res.status(409).json({ error: error.message });
      }
      next(error);
    }
  }
);

/**
 * POST /api/users/me/avatar
 * Upload user avatar image
 * Requires authentication
 * Accepts: multipart/form-data with 'avatar' field
 * Returns: { avatarUrl: string } (base64 data URL)
 */
router.post(
  '/me/avatar',
  authenticate,
  upload.single('avatar'),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const avatarUrl = await processAvatar(req.file.buffer);
      await updateUserProfile(req.user!.userId, { avatarUrl });
      
      res.json({ avatarUrl });
    } catch (error) {
      // Handle multer errors (file too large)
      if (error instanceof Error && 'code' in error && (error as any).code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large (max 5MB)' });
      }
      // Handle sharp processing errors (invalid image)
      if (error instanceof Error && error.message.includes('Input')) {
        return res.status(400).json({ error: 'Invalid image file' });
      }
      next(error);
    }
  }
);
export default router;
