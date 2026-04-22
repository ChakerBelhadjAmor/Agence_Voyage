'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api, apiErrorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', newPassword: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone ?? '',
        newPassword: '',
      });
    }
  }, [user, loading, router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload: any = { firstName: form.firstName, lastName: form.lastName, phone: form.phone || undefined };
      if (form.newPassword) payload.newPassword = form.newPassword;
      await api.patch('/users/me', payload);
      await refresh();
      setForm((s) => ({ ...s, newPassword: '' }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card">
        <h1 className="mb-4 text-xl font-semibold">My profile</h1>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First name</label>
              <input
                className="input"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Last name</label>
              <input
                className="input"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Email (read-only)</label>
            <input className="input bg-slate-100" value={user.email} readOnly />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="label">New password (optional)</label>
            <input
              className="input"
              type="password"
              minLength={8}
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            />
          </div>
          <button className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
