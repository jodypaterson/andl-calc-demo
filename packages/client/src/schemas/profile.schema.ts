import { z } from 'zod';

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be 50 characters or less'),
  bio: z
    .string()
    .max(500, 'Bio must be 500 characters or less')
    .optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
