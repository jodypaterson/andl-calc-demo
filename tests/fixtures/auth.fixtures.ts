import { faker } from '@faker-js/faker';

export interface Session {
  userId: string;
  token: string;
  expiresAt: Date;
}

export function createMockSession(overrides?: Partial<Session>): Session {
  return {
    userId: faker.string.uuid(),
    token: faker.string.alphanumeric(32),
    expiresAt: new Date(Date.now() + 3600000), // 1 hour
    ...overrides
  };
}

export function createExpiredToken(): string {
  return faker.string.alphanumeric(32);
}

export function createValidJWT(): string {
  // Simplified mock JWT
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${faker.string.alphanumeric(40)}.${faker.string.alphanumeric(43)}`;
}
