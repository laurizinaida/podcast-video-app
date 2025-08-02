import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import app from './index'

// Type definitions for API responses
interface HealthResponse {
  status: string
  timestamp: string
}

interface UserResponse {
  message: string
  user: {
    id: string
    email: string
    name: string
  }
}

interface ErrorResponse {
  error: string
}

// Mock D1 Database for testing
class MockD1Database {
  private users: any[] = []

  prepare(query: string) {
    return {
      bind: (...params: any[]) => ({
        first: async () => {
          if (query.includes('SELECT id FROM Users WHERE email')) {
            return this.users.find(u => u.email === params[0])
          }
          if (query.includes('SELECT * FROM Users WHERE email')) {
            return this.users.find(u => u.email === params[0])
          }
          return null
        },
        run: async () => {
          if (query.includes('INSERT INTO Users')) {
            const [id, email, name, password_hash, created_at] = params
            this.users.push({ id, email, name, password_hash, created_at })
            return { success: true }
          }
          return { success: false }
        }
      })
    }
  }

  reset() {
    this.users = []
  }
}

const mockDB = new MockD1Database()

// Create test environment with mocked DB
const createTestEnv = () => ({
  DB: mockDB as any
})

describe('API Tests', () => {
  let server: any

  beforeAll(() => {
    server = app
  })

  afterAll(() => {
    // Cleanup if needed
  })

  beforeEach(() => {
    mockDB.reset()
  })

  describe('Health Check', () => {
    it('should return health status', async () => {
      const res = await app.fetch(new Request('http://localhost/health'))
      expect(res.status).toBe(200)
      
      const data = await res.json() as HealthResponse
      expect(data.status).toBe('ok')
      expect(data.timestamp).toBeDefined()
    })
  })

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const res = await app.fetch(new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      }), createTestEnv())

      expect(res.status).toBe(201)
      
      const data = await res.json() as UserResponse
      expect(data.message).toBe('User registered successfully')
      expect(data.user.email).toBe(userData.email)
      expect(data.user.name).toBe(userData.name)
    })

    it('should reject registration with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      }

      const res = await app.fetch(new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      }), createTestEnv())

      expect(res.status).toBe(400)
    })

    it('should reject registration with short password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test2@example.com',
        password: '123'
      }

      const res = await app.fetch(new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      }), createTestEnv())

      expect(res.status).toBe(400)
    })
  })

  describe('User Login', () => {
    it('should login with valid credentials', async () => {
      // First register a user
      const userData = {
        name: 'Login Test User',
        email: 'login@example.com',
        password: 'password123'
      }

      await app.fetch(new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      }), createTestEnv())

      // Then try to login
      const loginData = {
        email: 'login@example.com',
        password: 'password123'
      }

      const res = await app.fetch(new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      }), createTestEnv())

      expect(res.status).toBe(200)
      
      const data = await res.json() as UserResponse
      expect(data.message).toBe('Login successful')
      expect(data.user.email).toBe(loginData.email)
    })

    it('should reject login with invalid credentials', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      }

      const res = await app.fetch(new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      }), createTestEnv())

      expect(res.status).toBe(401)
    })
  })
})