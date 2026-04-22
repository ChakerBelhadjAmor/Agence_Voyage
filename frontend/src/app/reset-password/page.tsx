'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { api, apiErrorMessage } from '@/lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password updated. Sign in.');
      router.push('/login');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="mb-4 text-xl font-semibold">Choose a new password</h1>
        {!token ? (
          <p className="text-red-600">Missing token. Request a new reset link.</p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="label">New password</label>
              <input
                className="input"
                type="password"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? 'Saving…' : 'Reset password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
