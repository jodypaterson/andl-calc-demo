import { PrismaClient } from '@prisma/client';
import { SafeUser, UpdateProfileInput } from '../types/user.js';

const prisma = new PrismaClient();

/**
 * Fetch user by ID with profile, excluding sensitive fields
 * @param userId - User ID to fetch
 * @returns SafeUser object or null if not found
 */
export async function getUserById(userId: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) {
    return null;
  }

  // Exclude sensitive fields
  const { passwordHash, tokenVersion, failedLoginAttempts, lockoutUntil, ...safeUser } = user;

  return safeUser as SafeUser;
}

/**
 * Update user profile information
 * @param userId - User ID to update
 * @param data - Profile data to update (displayName, email)
 * @returns Updated SafeUser object
 * @throws Error with status 409 if email already taken
 * @throws Error with status 404 if user not found
 */
export async function updateUserProfile(
  userId: string,
  data: UpdateProfileInput
): Promise<SafeUser> {
  // If email is being changed, check uniqueness
  if (data.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser && existingUser.id !== userId) {
      const error = new Error('Email already in use');
      (error as any).status = 409;
      throw error;
    }
  }

  // Update user and profile
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.email && { email: data.email }),
      profile: data.displayName
        ? {
            upsert: {
              create: { displayName: data.displayName },
              update: { displayName: data.displayName },
            },
          }
        : undefined,
    },
    include: { profile: true },
  });

  // Exclude sensitive fields
  const { passwordHash, tokenVersion, failedLoginAttempts, lockoutUntil, ...safeUser } =
    updatedUser;

  return safeUser as SafeUser;
}
