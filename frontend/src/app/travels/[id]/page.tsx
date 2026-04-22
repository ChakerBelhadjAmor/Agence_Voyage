'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api, apiErrorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Travel } from '@/lib/types';

export default function TravelDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [seats, setSeats] = useState(1);

  const { data: travel, isLoading } = useQuery({
    queryKey: ['travel', id],
    queryFn: async () => (await api.get<Travel>(`/travels/${id}`)).data,
  });

  const book = useMutation({
    mutationFn: async () => (await api.post('/reservations', { travelId: id, seats })).data,
    onSuccess: () => {
      toast.success('Reservation submitted (pending admin approval).');
      qc.invalidateQueries({ queryKey: ['my-reservations'] });
      router.push('/reservations');
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  if (isLoading || !travel) return <p className="text-slate-500">Loading…</p>;

  const start = new Date(travel.startDate).toLocaleDateString();
  const end = new Date(travel.endDate).toLocaleDateString();
  const reviews = travel.feedbacks ?? [];
  const avg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-4">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {travel.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={travel.imageUrl} alt={travel.title} className="h-72 w-full object-cover" />
          )}
          <div className="p-5">
            <h1 className="text-2xl font-bold">{travel.title}</h1>
            <p className="text-slate-600">{travel.destination}</p>
            <p className="mt-2 text-sm text-slate-500">
              {start} → {end} · capacity {travel.capacity}
            </p>
            <p className="mt-4 whitespace-pre-line text-slate-700">{travel.description}</p>
          </div>
        </div>

        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Reviews</h2>
            {avg && (
              <p className="text-sm text-slate-600">
                Average: <span className="font-semibold">{avg}/5</span> · {reviews.length} review
                {reviews.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-500">No reviews yet.</p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r.id} className="border-b border-slate-100 pb-3 last:border-b-0">
                  <p className="text-sm font-medium">
                    {'★'.repeat(r.rating)}
                    <span className="text-slate-300">{'★'.repeat(5 - r.rating)}</span>
                    <span className="ml-2 text-slate-500">
                      — {r.user?.firstName} {r.user?.lastName}
                    </span>
                  </p>
                  <p className="text-sm text-slate-700">{r.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <aside className="card h-fit">
        <p className="text-sm text-slate-500">Price per seat</p>
        <p className="mb-4 text-3xl font-bold text-brand-600">
          ${Number(travel.price).toFixed(2)}
        </p>

        {!user ? (
          <button onClick={() => router.push('/login')} className="btn-primary w-full">
            Sign in to book
          </button>
        ) : user.role === 'ADMIN' ? (
          <p className="text-sm text-slate-500">Admins cannot book trips.</p>
        ) : (
          <>
            <label className="label">Seats</label>
            <input
              type="number"
              className="input mb-3"
              min={1}
              max={travel.capacity}
              value={seats}
              onChange={(e) => setSeats(Math.max(1, Number(e.target.value)))}
            />
            <p className="mb-3 text-sm text-slate-600">
              Total:{' '}
              <span className="font-semibold">
                ${(Number(travel.price) * seats).toFixed(2)}
              </span>
            </p>
            <button
              className="btn-primary w-full"
              disabled={book.isPending}
              onClick={() => book.mutate()}
            >
              {book.isPending ? 'Booking…' : 'Book now'}
            </button>
          </>
        )}
      </aside>
    </div>
  );
}
