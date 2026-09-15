'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/Logo';

interface Props {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: Props) {
  const { user, loading, login, register } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && user) router.replace('/');
  }, [loading, user, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const name = String(form.get('name') ?? '').trim();

    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      if (mode === 'login') await login(email, password);
      else await register(name, email, password);
      router.replace('/');
    } catch (err) {
      if (err instanceof ApiError && err.errors?.length) {
        setFieldErrors(Object.fromEntries(err.errors.map((fe) => [fe.path, fe.message])));
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
      setSubmitting(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold tracking-tight">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {isLogin ? 'Sign in to open your canvases.' : 'A few details and you can start drawing.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!isLogin && <Input label="Name" name="name" autoComplete="name" required maxLength={60} error={fieldErrors.name} />}
            <Input label="Email" name="email" type="email" autoComplete="email" required error={fieldErrors.email} />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
              minLength={isLogin ? undefined : 8}
              error={fieldErrors.password}
            />

            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <Button type="submit" className="w-full" loading={submitting}>
              {isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Link href={isLogin ? '/register' : '/login'} className="font-medium text-zinc-900 underline-offset-4 hover:underline">
            {isLogin ? 'Sign up' : 'Sign in'}
          </Link>
        </p>
      </div>
    </main>
  );
}
