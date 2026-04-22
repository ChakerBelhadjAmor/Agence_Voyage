'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';
import { apiErrorMessage } from '@/lib/api';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register({ ...form, phone: form.phone || undefined });
      toast.success('Welcome aboard!');
      router.push('/');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="mb-4 text-xl font-semibold">Create your account</h1>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First name</label>
              <input
                className="input"
                required
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Last name</label>
              <input
                className="input"
                required
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              required
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Phone (optional)</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
          </div>
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already a member?{' '}
          <Link href="/login" className="text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
