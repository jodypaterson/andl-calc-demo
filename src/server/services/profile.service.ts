import { prisma } from '../prisma.js';
import type { Profile } from '@prisma/client';

/**
 * Default settings for new profiles
 */
export const DEFAULT_SETTINGS = {
  calculatorMode: 'DEG',
  precision: 2,
  theme: 'light'
} as const;

/**
 * Input for creating a new profile
 */
export interface CreateProfileInput {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  settings?: Record<string, any>;
}

/**
 * Input for updating an existing profile
 */
export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  settings?: Record<string, any>;
}

/**
 * Get profile by user ID
 * @param userId - User ID to fetch profile for
 * @returns Profile or null if not found
 */
export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  return await prisma.profile.findUnique({
    where: { user_id: userId }
  });
}

/**
 * Create a new profile for a user
 * @param userId - User ID to create profile for
 * @param data - Optional profile data (defaults applied if not provided)
 * @returns Created profile
 */
export async function createProfile(
  userId: string,
  data?: CreateProfileInput
): Promise<Profile> {
  return await prisma.profile.create({
    data: {
      user_id: userId,
      display_name: data?.displayName,
      bio: data?.bio,
      avatar_url: data?.avatarUrl,
      settings: data?.settings ?? DEFAULT_SETTINGS
    }
  });
}

/**
 * Update an existing profile or create if it doesn't exist (upsert pattern)
 * @param userId - User ID to update profile for
 * @param data - Profile data to update
 * @returns Updated or created profile
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileInput
): Promise<Profile> {
  return await prisma.profile.upsert({
    where: { user_id: userId },
    update: {
      display_name: data.displayName,
      bio: data.bio,
      avatar_url: data.avatarUrl,
      settings: data.settings
    },
    create: {
      user_id: userId,
      display_name: data.displayName,
      bio: data.bio,
      avatar_url: data.avatarUrl,
      settings: data.settings ?? DEFAULT_SETTINGS
    }
  });
}
