'use client';

import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { api, apiErrorMessage } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setDone(true);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="mb-2 text-xl font-semibold">Reset your password</h1>
        {done ? (
          <p className="text-sm text-slate-600">
            If an account exists for <b>{email}</b>, we sent a reset link. Check your inbox.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <p className="text-sm text-slate-500">
              Enter your account email and we will send you a link to set a new password.
            </p>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
