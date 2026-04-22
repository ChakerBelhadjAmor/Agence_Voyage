'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-brand-600">
          Wanderly
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-slate-600 hover:text-slate-900">
            Travels
          </Link>
          {user && (
            <>
              <Link href="/reservations" className="text-slate-600 hover:text-slate-900">
                My reservations
              </Link>
              <Link href="/profile" className="text-slate-600 hover:text-slate-900">
                Profile
              </Link>
            </>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/admin" className="text-brand-600 hover:text-brand-700">
              Admin
            </Link>
          )}
          {!user ? (
            <>
              <Link href="/login" className="btn-outline">
                Sign in
              </Link>
              <Link href="/register" className="btn-primary">
                Register
              </Link>
            </>
          ) : (
            <button onClick={handleLogout} className="btn-outline">
              Sign out · {user.firstName}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
