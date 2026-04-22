'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api, apiErrorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Reservation } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';

export default function MyReservationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [reviewing, setReviewing] = useState<Reservation | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  const list = useQuery({
    queryKey: ['my-reservations'],
    enabled: !!user,
    queryFn: async () => (await api.get<Reservation[]>('/reservations/me')).data,
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => api.delete(`/reservations/${id}`),
    onSuccess: () => {
      toast.success('Reservation cancelled');
      qc.invalidateQueries({ queryKey: ['my-reservations'] });
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  if (loading || !user) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My reservations</h1>
      {list.isLoading ? (
        <p className="text-slate-500">Loading…</p>
      ) : !list.data || list.data.length === 0 ? (
        <p className="text-slate-500">
          You have no reservations yet.{' '}
          <Link href="/" className="text-brand-600 hover:underline">
            Browse trips
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-3">
          {list.data.map((r) => {
            const tripEnded = r.travel && new Date(r.travel.endDate) < new Date();
            const canCancel = r.status === 'PENDING' || r.status === 'CONFIRMED';
            const canReview = r.status === 'CONFIRMED' && tripEnded && !r.feedback;
            return (
              <li key={r.id} className="card flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{r.travel?.title}</p>
                  <p className="text-sm text-slate-500">
                    {r.travel?.destination} · {r.seats} seat(s) · ${Number(r.totalPrice).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400">
                    Booked {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={r.status} />
                  {canReview && (
                    <button className="btn-outline" onClick={() => setReviewing(r)}>
                      Leave a review
                    </button>
                  )}
                  {canCancel && (
                    <button
                      className="btn-danger"
                      disabled={cancel.isPending}
                      onClick={() => cancel.mutate(r.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {reviewing && (
        <ReviewModal
          reservation={reviewing}
          onClose={() => setReviewing(null)}
          onSaved={() => {
            setReviewing(null);
            qc.invalidateQueries({ queryKey: ['my-reservations'] });
          }}
        />
      )}
    </div>
  );
}

function ReviewModal({
  reservation,
  onClose,
  onSaved,
}: {
  reservation: Reservation;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await api.post('/feedback', { reservationId: reservation.id, rating, comment });
      toast.success('Thanks! Your review is awaiting moderation.');
      onSaved();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
        <h2 className="mb-3 text-lg font-semibold">Review {reservation.travel?.title}</h2>
        <label className="label">Rating</label>
        <select
          className="input mb-3"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} star{n > 1 ? 's' : ''}
            </option>
          ))}
        </select>
        <label className="label">Comment</label>
        <textarea
          className="input mb-3 h-28"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience…"
        />
        <div className="flex justify-end gap-2">
          <button className="btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={busy || comment.length < 3} onClick={submit}>
            {busy ? 'Saving…' : 'Submit review'}
          </button>
        </div>
      </div>
    </div>
  );
}
