'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const tabs = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/travels', label: 'Travels' },
  { href: '/admin/reservations', label: 'Reservations' },
  { href: '/admin/feedback', label: 'Feedback' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (user.role !== 'ADMIN') router.replace('/');
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-slate-500">Manage the catalog, reservations and feedback.</p>
      </div>
      <nav className="flex flex-wrap gap-2 border-b border-slate-200">
        {tabs.map((t) => {
          const active = path === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`rounded-t-md px-4 py-2 text-sm font-medium transition ${
                active
                  ? 'border-b-2 border-brand-500 text-brand-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
