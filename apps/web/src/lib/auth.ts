import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"
import bcrypt from 'bcryptjs';
import { User } from '@podcast-video-app/shared/types/user';
import { D1Database } from '@cloudflare/workers-types';
import { D1Adapter } from "@auth/d1-adapter";

// 导出一个可复用的配置生成函数
export const getConfig = (db: D1Database): NextAuthConfig => {
  return {
    // @ts-ignore // D1Adapter is compatible
    adapter: D1Adapter(db),
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
            console.error("Database binding is not available in authorize function.");
            throw new Error("Database not available.");
          }

          try {
            const userFromDb = await db.prepare('SELECT * FROM Users WHERE email = ?1')
              .bind(credentials.email)
              .first<User & { password_hash: string }>();

            if (!userFromDb || !userFromDb.password_hash) {
              return null; // 用户不存在或没有设置密码
            }

            const isValidPassword = await bcrypt.compare(
              credentials.password as string, 
              userFromDb.password_hash
            );

            if (!isValidPassword) {
              return null; // 密码错误
            }

            // 返回的用户对象将用于创建会话
            return {
              id: userFromDb.id,
              name: userFromDb.name,
              email: userFromDb.email,
            };
          } catch (error) {
            console.error('Authorize error:', error);
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
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }) {
        if (token && session.user) {
          session.user.id = token.id as string;
        }
        return session;
      },
    },
    session: {
      strategy: "jwt",
      maxAge: 24 * 60 * 60, // 24 hours
    },
    secret: process.env.AUTH_SECRET,
  }
}
