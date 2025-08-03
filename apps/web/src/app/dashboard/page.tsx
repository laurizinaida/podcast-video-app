'use client';

import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, status, logout } = useAuthStore();

  useEffect(() => {
    // This is a good place to trigger a check for auth status if it's not already loaded
    // For now, we assume the middleware has done its job.
  }, []);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    // This should ideally not be reached if middleware is set up correctly,
    // but it's a good fallback.
    return <div>Redirecting to login...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-2xl rounded-md bg-white p-8 shadow-md">
        <h1 className="mb-4 text-center text-3xl font-bold">Welcome to your Dashboard</h1>
        {user && <p className="mb-6 text-center text-lg">Hello, {user.name || user.email}!</p>}
        <button
          onClick={() => logout()}
          className="w-full rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
