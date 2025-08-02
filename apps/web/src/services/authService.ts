import { signIn, signOut } from "next-auth/react";
import { auth } from "@/lib/auth";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  message?: string;
}

export interface Session {
  user: User;
}

export async function login(credentials: LoginCredentials): Promise<User> {
  try {
    const result = await signIn('credentials', {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    // 获取当前会话以返回用户信息
    const session = await getCurrentUser();
    if (!session?.user) {
      throw new Error('Failed to get user session after login');
    }

    return session.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function register(userData: RegisterData): Promise<User> {
  try {
    // 先调用注册 API
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    const data: AuthResponse = await response.json();
    
    // 注册成功后自动登录
    await login({
      email: userData.email,
      password: userData.password,
    });

    return data.user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    await signOut({ redirect: false });
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<Session | null> {
  try {
    // 在客户端组件中，我们需要使用 useSession hook
    // 这个函数主要用于服务端或初始化时获取会话
    const session = await auth();
    
    if (session?.user) {
      return {
        user: {
          id: session.user.id as string,
          email: session.user.email as string,
          name: session.user.name as string,
        }
      };
    }

    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}