import { User, Profile } from '@prisma/client';

/**
 * SafeUser type - User data safe for client exposure
 * Excludes sensitive authentication and security fields
 */
export type SafeUser = Omit<
  User,
  'passwordHash' | 'tokenVersion' | 'failedLoginAttempts' | 'lockoutUntil'
> & {
  profile: Profile | null;
};

/**
 * Input type for updating user profile information
 */
export type UpdateProfileInput = {
  displayName?: string;
  email?: string;
};
