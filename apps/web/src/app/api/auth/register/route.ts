import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { D1Database } from '@cloudflare/workers-types';

// Define the environment interface
interface Env {
  DB: D1Database;
}

// User registration schema
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: NextRequest) {
  try {
    // Access bindings and environment variables in Next.js on Cloudflare
    const env = (req as any).ctx.env as Env;
    const body = await req.json();
    
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await env.DB.prepare('SELECT id FROM Users WHERE email = ?1')
      .bind(email)
      .first();

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = nanoid();
    const createdAt = new Date().toISOString();

    await env.DB.prepare(
      'INSERT INTO Users (id, email, name, password_hash, created_at) VALUES (?1, ?2, ?3, ?4, ?5)'
    ).bind(userId, email, name, password_hash, createdAt).run();

    // Return a clean user object, without the password hash
    const newUser = {
      id: userId,
      email,
      name,
      createdAt,
    };

    return NextResponse.json({ message: 'User registered successfully', user: newUser }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    // In a real app, you'd want more sophisticated logging
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
