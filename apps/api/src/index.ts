import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS middleware
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:8787'],
  credentials: true,
}))

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// User registration schema
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// User login schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

// Register endpoint
app.post('/auth/register', zValidator('json', registerSchema), async (c) => {
  try {
    const { name, email, password } = c.req.valid('json')

    // Check if user already exists
    const existingUser = await c.env.DB.prepare('SELECT id FROM Users WHERE email = ?')
      .bind(email)
      .first()

    if (existingUser) {
      return c.json({ error: 'User already exists' }, 409)
    }

    // Hash password
    const saltRounds = 12
    const password_hash = await bcrypt.hash(password, saltRounds)

    // Create user
    const userId = nanoid()
    const created_at = new Date().toISOString()

    await c.env.DB.prepare(`
      INSERT INTO Users (id, email, name, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(userId, email, name, password_hash, created_at).run()

    return c.json({
      message: 'User registered successfully',
      user: {
        id: userId,
        email,
        name,
        created_at,
      },
    }, 201)
  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Login endpoint
app.post('/auth/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json')

    // Find user
    const user = await c.env.DB.prepare('SELECT * FROM Users WHERE email = ?')
      .bind(email)
      .first() as any

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    return c.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Logout endpoint
app.post('/auth/logout', async (c) => {
  try {
    // Clear any server-side session data if needed
    // For JWT-based auth, we mainly rely on client-side token removal
    
    return c.json({ message: 'Logout successful' }, 200)
  } catch (error) {
    console.error('Logout error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get current user endpoint
app.get('/auth/me', async (c) => {
  try {
    // In a real implementation, this would verify the JWT token
    // and return user data. For now, we'll return a placeholder
    // since this will be handled by NextAuth in the frontend
    
    return c.json({ error: 'Not implemented - use NextAuth session' }, 501)
  } catch (error) {
    console.error('Get user error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

const port = 3002
console.log(`Server is running on port ${port}`)

export default {
  port,
  fetch: app.fetch,
}
