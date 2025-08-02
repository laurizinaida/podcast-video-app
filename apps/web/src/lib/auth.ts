import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

export const config = {
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
          return null
        }

        try {
          // 根据架构文档要求，这里应该调用后端API进行认证
          // 但由于当前后端是独立的Hono应用，我们先使用模拟认证
          // 在生产环境中，这里应该调用实际的认证服务
          
          // 模拟认证逻辑 - 仅用于开发测试
          if (credentials.email === "test@example.com" && credentials.password === "password") {
            return {
              id: "test-user-id",
              email: credentials.email,
              name: "Test User",
              image: null,
            }
          }

          // 对于其他邮箱，尝试调用后端API
          const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:8787'
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!response.ok) {
            return null
          }

          const data = await response.json()
          
          if (data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              image: data.user.image || null,
            }
          }
          
          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
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
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)