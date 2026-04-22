'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api, apiErrorMessage } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import type { Feedback, FeedbackStatus } from '@/lib/types';

const STATUSES: (FeedbackStatus | 'ALL')[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

export default function AdminFeedbackPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>('PENDING');

  const list = useQuery({
    queryKey: ['admin-feedback'],
    queryFn: async () => (await api.get<Feedback[]>('/feedback/admin')).data,
  });

  const moderate = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: 'APPROVED' | 'REJECTED' }) =>
      api.patch(`/feedback/${id}/moderate`, { decision }),
    onSuccess: () => {
      toast.success('Updated');
      qc.invalidateQueries({ queryKey: ['admin-feedback'] });
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/feedback/${id}`),
    onSuccess: () => {
      toast.success('Deleted');
      qc.invalidateQueries({ queryKey: ['admin-feedback'] });
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const rows = useMemo(
    () => (filter === 'ALL' ? list.data : list.data?.filter((f) => f.status === filter)),
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

      <div className="space-y-3">
        {rows?.map((f) => (
          <div key={f.id} className="card">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {f.travel?.title}{' '}
                  <span className="text-slate-500">— {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</span>
                </p>
                <p className="text-xs text-slate-500">
                  by {f.user?.firstName} {f.user?.lastName} ({f.user?.email}) ·{' '}
                  {new Date(f.createdAt).toLocaleString()}
                </p>
              </div>
              <StatusBadge status={f.status} />
            </div>
            <p className="text-sm text-slate-700">{f.comment}</p>
            <div className="mt-3 flex justify-end gap-2">
              {f.status !== 'APPROVED' && (
                <button
                  className="btn-primary"
                  onClick={() => moderate.mutate({ id: f.id, decision: 'APPROVED' })}
                >
                  Approve
                </button>
              )}
              {f.status !== 'REJECTED' && (
                <button
                  className="btn-outline"
                  onClick={() => moderate.mutate({ id: f.id, decision: 'REJECTED' })}
                >
                  Reject
                </button>
              )}
              <button className="btn-danger" onClick={() => remove.mutate(f.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {rows && rows.length === 0 && <p className="text-slate-500">No feedback.</p>}
      </div>
    </div>
  );
}
