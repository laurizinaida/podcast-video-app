import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"
import bcrypt from 'bcryptjs';
import { User } from '@podcast-video-app/shared/types/user';
import { D1Database } from '@cloudflare/workers-types';

export const getConfig = (env?: any): NextAuthConfig => {
  const db = env?.DB as D1Database;

  return {
    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
      Credentials({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          if (!db) {
            console.error("Database binding not available in authorize function.");
            // Returning null or throwing an error is appropriate here.
            return null;
          }

          try {
            const userFromDb = await db.prepare('SELECT * FROM Users WHERE email = ?1')
              .bind(credentials.email)
              .first<User & { password_hash: string }>();

            if (!userFromDb || !userFromDb.password_hash) {
              return null;
            }

            const isValidPassword = await bcrypt.compare(credentials.password as string, userFromDb.password_hash);

            if (!isValidPassword) {
              return null;
            }

            return {
              id: userFromDb.id,
              name: userFromDb.name,
              email: userFromDb.email,
            };
          } catch (error) {
            console.error('Auth error:', error);
            return null;
          }
        }
      })
    ],
    pages: {
      signIn: '/auth/login',
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id
        }
        return token
      },
      async session({ session, token }) {
        if (token) {
          session.user.id = token.id as string
        }
        return session
      },
    },
    session: {
      strategy: "jwt",
      maxAge: 24 * 60 * 60, // 24 hours
    },
    secret: process.env.AUTH_SECRET,
  }
}

// We get the handlers dynamically in the route now.
// So we export the main NextAuth object configured with our function.
export const { handlers, auth, signIn, signOut } = NextAuth(getConfig((globalThis as any).auth?.env))
