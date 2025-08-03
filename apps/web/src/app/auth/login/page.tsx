import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-md bg-card p-8 shadow-md text-card-foreground">
        <h1 className="mb-6 text-center text-2xl font-bold">Log in to your Account</h1>
        <LoginForm />
        <p className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/auth/register" className="font-medium text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
