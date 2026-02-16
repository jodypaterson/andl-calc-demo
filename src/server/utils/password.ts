import bcrypt from 'bcrypt';

/**
 * Salt rounds for bcrypt hashing.
 * Cost factor 12 = ~2-3 hashes/second (optimal balance of security and UX).
 */
const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt.
 * Automatically generates and embeds a random salt in the hash.
 * 
 * @param plaintext - The plaintext password to hash
 * @returns Promise resolving to the hashed password (60 characters, bcrypt v2b format)
 * 
 * @example
 * const hash = await hashPassword('mySecretPassword');
 * // hash starts with '$2b$' and is 60 characters long
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

/**
 * Compare a plaintext password with a bcrypt hash.
 * Uses timing-safe comparison to prevent timing attacks.
 * 
 * @param plaintext - The plaintext password to verify
 * @param hash - The bcrypt hash to compare against
 * @returns Promise resolving to true if password matches, false otherwise
 * 
 * @example
 * const isValid = await comparePassword('mySecretPassword', storedHash);
 * if (isValid) {
 *   // Password is correct
 * }
 */
export async function comparePassword(
  plaintext: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}
