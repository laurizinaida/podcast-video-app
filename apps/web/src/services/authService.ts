import { apiClient } from './apiClient';
import { User } from '@/packages/shared/types/user';
import { signIn, signOut, getSession } from 'next-auth/react';

export type RegisterCredentials = Omit<User, 'id' | 'createdAt'>;
export type LoginCredentials = Pick<User, 'email' | 'password'>;

export async function register(credentials: RegisterCredentials): Promise<User> {
  const response = await apiClient.post('/auth/register', credentials);
  if (response.status !== 201) {
    throw new Error(response.data.error || 'Registration failed');
  }
  // After successful registration, automatically sign in the user
  await login({ email: credentials.email, password: credentials.password });
  return response.data.user;
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const result = await signIn('credentials', {
    redirect: false,
    email: credentials.email,
    password: credentials.password,
  });

  if (result?.error) {
    throw new Error(result.error);
  }

  // Fetch the session to get user data
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Login successful, but failed to retrieve session.');
  }
  return session.user as User;
}

export async function logout(): Promise<void> {
  await signOut({ redirect: false });
}

export async function getMe(): Promise<User | null> {
  const session = await getSession();
  return session?.user as User | null;
}
