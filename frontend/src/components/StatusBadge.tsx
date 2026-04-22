import type { ReservationStatus, FeedbackStatus } from '@/lib/types';

const STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-slate-200 text-slate-700',
  APPROVED: 'bg-emerald-100 text-emerald-800',
};

export function StatusBadge({ status }: { status: ReservationStatus | FeedbackStatus }) {
  return <span className={`badge ${STYLES[status] ?? 'bg-slate-100 text-slate-700'}`}>{status}</span>;
}
