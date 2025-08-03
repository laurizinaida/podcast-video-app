import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-md bg-card p-8 shadow-md text-card-foreground">
        <h1 className="mb-6 text-center text-2xl font-bold">Create an Account</h1>
        <RegisterForm />
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
