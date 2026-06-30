'use client';

import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { Menu, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();
  const { user } = useUser();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="flex h-16 items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-xl text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-500">
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              {user.email}
            </span>
          </div>
        )}

        <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs gap-1.5 py-1.5 px-3 rounded-lg border-zinc-200 hover:bg-zinc-50 hover:text-red-600">
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
