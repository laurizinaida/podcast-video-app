/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST as registerHandler } from './route';
import { D1Database } from '@cloudflare/workers-types';

// Mock D1 Database for testing
class MockD1Database {
  private users: any[] = [];

  prepare(query: string) {
    const self = this;
    return {
      bind: (...params: any[]) => ({
        first: async () => {
          if (query.includes('SELECT id FROM Users WHERE email = ?1')) {
            return self.users.find(u => u.email === params[0]) || null;
          }
          return null;
        },
        run: async () => {
          if (query.includes('INSERT INTO Users')) {
            const [id, email, name, password_hash, created_at] = params;
            self.users.push({ id, email, name, password_hash, created_at });
            return { success: true };
          }
          return { success: false };
        },
      }),
    };
  }
  reset() {
    this.users = [];
  }
}

const mockDB = new MockD1Database();

// Helper to create a mock NextRequest
const createMockRequest = (body: any): NextRequest => {
  const req = new NextRequest('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  // Mock the Cloudflare context
  (req as any).ctx = {
    env: {
      DB: mockDB as unknown as D1Database,
    },
  };
  return req;
};

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    mockDB.reset();
  });

  it('should register a new user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
    };
    const req = createMockRequest(userData);
    const res = await registerHandler(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.message).toBe('User registered successfully');
    expect(body.user.email).toBe(userData.email);
  });

  it('should return 409 if user already exists', async () => {
    const userData = { name: 'Existing User', email: 'exists@example.com', password: 'Password123' };
    const firstReq = createMockRequest(userData);
    await registerHandler(firstReq);

    const secondReq = createMockRequest(userData);
    const res = await registerHandler(secondReq);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toBe('User already exists');
  });

  it('should return 400 for invalid password', async () => {
    const userData = { name: 'Test', email: 'test@example.com', password: '123' };
    const req = createMockRequest(userData);
    const res = await registerHandler(req);
    expect(res.status).toBe(400);
  });
});
