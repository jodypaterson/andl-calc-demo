import { z } from 'zod';

/**
 * Validation schema for user profile updates
 */
export const updateProfileSchema = z
  .object({
    displayName: z.string().min(1).max(100).trim().optional(),
    email: z.string().email().optional(),
  })
  .strict(); // Reject unknown fields
