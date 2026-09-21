'use client';

import { useState } from 'react';
import { isPreview } from '@/lib/preview';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [existingAccount, setExistingAccount] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) {
      setError('Authentication is disabled in local preview. Open the dashboard to explore sample trades.');
      return;
    }
    setError('');
    setMessage('');
    setExistingAccount(false);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError?.message.toLowerCase().includes('already registered')) {
        setExistingAccount(true);
        setError('This email already has a login account. Deleting journal or profile rows does not remove it. Sign in with your existing password.');
        return;
      }
      if (authError) throw authError;

      if (!data.session) {
        setMessage('Check your email to confirm your account, then sign in.');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError((err instanceof Error ? err.message : '') || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md space-y-6">
        {isPreview && <Link href="/dashboard" className="block text-center text-sm text-indigo-600 underline">Local preview · Explore dashboard with sample data</Link>}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 bg-gradient-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent">
            AI Trading Journal
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Create an account to start leveling up your trading edge
          </p>
        </div>

        <Card className="shadow-lg border-zinc-200/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && <p role="status" className="text-sm text-emerald-600">{message}</p>}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs px-4 py-3 rounded-xl border border-red-100 dark:border-red-900/50">
                {error}
                {existingAccount && <Link href="/login" className="block mt-3 font-semibold underline">Sign in to your existing account →</Link>}
              </div>
            )}

            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              <UserPlus className="w-4 h-4 shrink-0" /> Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              Sign in instead
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

