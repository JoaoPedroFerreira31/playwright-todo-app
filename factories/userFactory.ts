import crypto from 'node:crypto';

export type UserData = { name: string; email: string; password: string };

export function createUserData(overrides: Partial<UserData> = {}): UserData {
      
  const name = 'New User';
  const email = `user-${crypto.randomUUID()}-${Math.floor(Math.random() * 1000)}@example.com`;
  const password = 'password123';

  return { name, email, password, ...overrides };  
}