'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api, apiErrorMessage } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import type { Reservation, ReservationStatus } from '@/lib/types';

const STATUSES: (ReservationStatus | 'ALL')[] = ['ALL', 'PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED'];

export default function AdminReservationsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>('ALL');

  const list = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: async () => (await api.get<Reservation[]>('/reservations')).data,
  });

  const decide = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: 'CONFIRMED' | 'REJECTED' }) =>
      api.patch(`/reservations/${id}/decision`, { decision }),
    onSuccess: () => {
      toast.success('Updated');
      qc.invalidateQueries({ queryKey: ['admin-reservations'] });
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => api.delete(`/reservations/${id}`),
    onSuccess: () => {
      toast.success('Cancelled');
      qc.invalidateQueries({ queryKey: ['admin-reservations'] });
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const rows = useMemo(
    () => (filter === 'ALL' ? list.data : list.data?.filter((r) => r.status === filter)),
    [filter, list.data],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`badge ${
              filter === s ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">Travel</th>
              <th>Client</th>
              <th>Seats</th>
              <th>Total</th>
              <th>Status</th>
              <th>When</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows?.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="py-2 font-medium">{r.travel?.title}</td>
                <td>
                  {r.user?.firstName} {r.user?.lastName}
                  <br />
                  <span className="text-xs text-slate-500">{r.user?.email}</span>
                </td>
                <td>{r.seats}</td>
                <td>${Number(r.totalPrice).toFixed(2)}</td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
                <td className="text-xs text-slate-500">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="space-x-2 whitespace-nowrap text-right">
                  {r.status === 'PENDING' && (
                    <>
                      <button
                        className="btn-primary"
                        onClick={() => decide.mutate({ id: r.id, decision: 'CONFIRMED' })}
                      >
                        Confirm
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => decide.mutate({ id: r.id, decision: 'REJECTED' })}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                    <button className="btn-outline" onClick={() => cancel.mutate(r.id)}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {rows && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-500">
                  No reservations.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
