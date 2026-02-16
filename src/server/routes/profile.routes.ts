import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate.js';
import { getProfileByUserId, createProfile, updateProfile } from '../services/profile.service.js';
import { updateProfileSchema } from '../schemas/profile.schema.js';
import { ZodError } from 'zod';

const router = Router();

/**
 * GET /api/profile
 * Get current user's profile (creates with defaults if doesn't exist)
 * Requires authentication
 */
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    let profile = await getProfileByUserId(req.user.userId);

    // Lazy creation: if profile doesn't exist, create with defaults
    if (!profile) {
      profile = await createProfile(req.user.userId);
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/profile
 * Update current user's profile (creates if doesn't exist - upsert)
 * Requires authentication
 * Body: { displayName?, bio?, avatarUrl?, settings? }
 */
router.put('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Validate request body with Zod
    const validatedData = updateProfileSchema.parse(req.body);

    // Upsert profile (creates if not exists, updates if exists)
    const profile = await updateProfile(req.user.userId, validatedData);

    res.json(profile);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
      return;
    }
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
