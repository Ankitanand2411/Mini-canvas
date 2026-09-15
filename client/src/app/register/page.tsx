import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth/AuthForm';

export const metadata: Metadata = { title: 'Sign up · Mini Canvas' };

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
