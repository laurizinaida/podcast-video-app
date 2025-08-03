## **第十一部分：实现架构与核心模式 (Implementation Architecture & Core Patterns)**

本部分提供了将高层架构转化为可执行代码的强制性模式和规范。

### **11.1 前端实现模式 (Frontend Implementation Patterns)**

#### **11.1.1 状态管理模式 (State Management Pattern)**

使用Zustand提供一个全局的认证状态存储。

* **文件位置**: `apps/web/src/app/lib/stores/authStore.ts`

* **代码模板**:

  ```typescript
  import { create } from 'zustand';
  import { User } from '@/packages/shared/types/user';
  import * as authService from '@/apps/web/src/app/lib/services/authService';

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
    // ... (login, logout, checkAuth 实现) ...
  }));
  ```

#### **11.1.2 API服务层模式 (API Service Layer Pattern)**

所有与后端API的交互都必须通过服务层进行封装。

* **文件位置**: `apps/web/src/app/lib/services/authService.ts`
* **代码模板**:

  ```typescript
  import { apiClient } from './apiClient';
  // ... (接口定义和函数实现) ...
  ```

#### **11.1.3 受保护路由模式 (Protected Route Pattern)**

使用Next.js Middleware来保护需要用户登录才能访问的页面。

* **文件位置**: `apps/web/middleware.ts`

* **代码模板**:

  ```typescript
  import { NextResponse } from 'next/server';
  import type { NextRequest } from 'next/server';
  import { getToken } from 'next-auth/jwt';

  export async function middleware(req: NextRequest) {
    // ... (中间件逻辑) ...
  }

  export const config = {
    matcher: [
      '/dashboard/:path*',
      '/login',
      '/register',
    ],
  };
  ```

#### **11.1.4 认证信息传递模式 (Authenticated Request Pattern)**

**核心原则：** 我们的认证体系依赖于由后端设置的、符合安全标准的 `HttpOnly` Cookie。这意味着前端应用**无需也禁止**手动管理或在请求头（Request Headers）中附加任何Token。

### **11.2 后端实现模式 (Backend Implementation Patterns)**

* **服务架构:** **必须**使用 **Next.js 内置的、基于文件系统的API路由**来定义和管理所有API端点。业务逻辑与数据访问逻辑**必须**通过仓储模式 (Repository Pattern) 或类似的服务层进行隔离，以保持代码的整洁和可测试性。
* **认证与授权:** 使用`withAuth`中间件或在API路由处理器中通过`getServerSession`来保护需要登录才能访问的API端点。
* **渲染服务架构:** 采用异步任务工作者模式，通过Flask API接收任务，放入内部队列，由后台进程调用FFmpeg处理，并通过回调API通知Worker任务完成状态。

***
