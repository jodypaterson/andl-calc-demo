import { z } from 'zod';

/**
 * Schema for updating profile data
 * All fields are optional to support partial updates
 */
export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name must be at least 1 character')
    .max(100, 'Display name must be at most 100 characters')
    .trim()
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be at most 500 characters')
    .optional(),
  avatarUrl: z
    .string()
    .url('Avatar URL must be a valid URL')
    .optional(),
  settings: z
    .record(z.any())
    .optional()
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
