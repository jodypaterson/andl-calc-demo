import { faker } from '@faker-js/faker';

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
}

export function createValidUser(overrides?: Partial<User>): User {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
    role: 'user',
    ...overrides
  };
}

export function createAdminUser(overrides?: Partial<User>): User {
  return createValidUser({ role: 'admin', ...overrides });
}
