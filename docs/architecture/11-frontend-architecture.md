## **第十一部分：前端架构 (Frontend Architecture)**

### **11.1 核心实现模式 (Core Implementation Patterns)**

为了确保代码的高度一致性和可维护性，所有`dev` Agent在实现核心功能时，**必须**遵循以下模式。

#### **11.1.1 状态管理模式 (State Management Pattern)**

使用Zustand提供一个全局的认证状态存储。

* **文件位置**: `apps/web/stores/authStore.ts`

* **代码模板**:
  
  ```typescript
  import { create } from 'zustand';
  import { User } from '@/packages/shared/types/user';
  import * as authService from '@/apps/web/services/authService';
  
  interface AuthState {
    user: User | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
    login: (credentials: authService.LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
  }
  
  export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    status: 'loading',
  
    login: async (credentials) => {
      try {
        const user = await authService.login(credentials);
        set({ user, status: 'authenticated' });
      } catch (error) {
        console.error("Login failed:", error);
        set({ user: null, status: 'unauthenticated' });
        throw error;
      }
    },
  
    logout: async () => {
      await authService.logout();
      set({ user: null, status: 'unauthenticated' });
    },
  
    checkAuth: async () => {
      try {
        const session = await authService.getMe();
        if (session && session.user) {
          set({ user: session.user as User, status: 'authenticated' });
        } else {
           set({ user: null, status: 'unauthenticated' });
        }
      } catch {
        set({ user: null, status: 'unauthenticated' });
      }
    },
  }));
  ```

#### **11.1.2 API服务层模式 (API Service Layer Pattern)**

所有与后端API的交互都必须通过服务层进行封装。

* **文件位置**: `apps/web/services/authService.ts`

* **代码模板**:
  
  ```typescript
  // Types would be imported from a shared package
  // For simplicity, defining inline here.
  export interface LoginCredentials {
    email: string;
    password?: string;
    provider?: 'google';
  }
  
  // A simplified representation of the session object
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
  
  // Assume a global fetch client is configured to handle errors
  import { apiClient } from './apiClient';
  
  export const login = async (credentials: LoginCredentials): Promise<Session['user']> => {
      // This would typically use NextAuth's signIn function
      // For pattern demonstration, we show a direct API call
      const response = await apiClient.post('/auth/login', credentials);
      return response.user;
  };
  
  export const logout = async (): Promise<void> => {
      // Uses NextAuth's signOut
      await apiClient.post('/auth/logout');
  };
  
  export const getMe = async (): Promise<Session | null> => {
      // Uses NextAuth's getSession
      return await apiClient.get('/auth/me');
  };
  ```

#### **11.1.3 受保护路由模式 (Protected Route Pattern)**

使用Next.js Middleware来保护需要用户登录才能访问的页面。

* **文件位置**: `apps/web/middleware.ts`

* **代码模板**:
  
  ```typescript
  import { NextResponse } from 'next/server';
  import type { NextRequest } from 'next/server';
  
  // This is the modern approach using Next.js Middleware with Auth.js
  import { getToken } from 'next-auth/jwt';
  
  export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  
    const { pathname } = req.nextUrl;
  
    // If the user is not authenticated and is trying to access a protected route,
    // redirect them to the login page.
    if (!token && pathname.startsWith('/dashboard')) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(loginUrl);
    }
  
    // If the user is authenticated and tries to access login/register,
    // redirect them to the dashboard.
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  
    return NextResponse.next();
  }
  
  // See "Matching Paths" below to learn more
  export const config = {
    matcher: [
      '/dashboard/:path*',
      '/login',
      '/register',
    ],
  };
  ```

#### **11.1.4 认证信息传递模式 (Authenticated Request Pattern)**

**核心原则：** 我们的认证体系依赖于由后端设置的、符合安全标准的 `HttpOnly` Cookie。这意味着前端应用**无需也禁止**手动管理或在请求头（Request Headers）中附加任何Token（如 `Authorization: Bearer ...`）。

**前端 `dev` Agent 实施指南:**

1. **调用服务层:** 当需要请求一个受保护的后端API时（例如，获取用户项目列表），你只需像调用任何普通API一样调用相应的服务层函数（如 `projectService.getProjects()`）。
2. **浏览器自动处理:** 浏览器会自动将当前域名下的 `HttpOnly` 会话Cookie附加到你的`fetch`请求中。你不需要编写任何特殊代码来处理认证信息的附加。
3. **服务层封装:** `apiClient` 或服务层函数负责发起请求并处理响应，无需关心认证细节。

**后端 `dev` Agent 实施指南:**

1. **API路由保护:** 在你的后端API路由（Cloudflare Worker / Next.js API Route）中，你**必须**使用 `Auth.js` (NextAuth) 提供的服务端工具来获取和验证当前用户的会话。
2. **获取会话:** 通过从请求中解析出的Cookie，你可以安全地获取到用户信息。