'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DashboardKpis } from '@/lib/types';

export default function AdminOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-kpis'],
    queryFn: async () => (await api.get<DashboardKpis>('/admin/dashboard/kpis')).data,
  });

  if (isLoading || !data) return <p className="text-slate-500">Loading KPIs…</p>;

  const download = async (path: string, filename: string) => {
    const res = await api.get(path, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const max = Math.max(1, ...data.daily.map((d) => d.bookings));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total users" value={data.users} hint={`${data.clients} clients`} />
        <Kpi
          label="Active travels"
          value={data.activeTravels}
          hint={`${data.travels} total`}
        />
        <Kpi
          label="Reservations"
          value={data.reservations.total}
          hint={`${data.reservations.confirmed} confirmed · ${data.reservations.pending} pending`}
        />
        <Kpi label="Revenue" value={`$${data.revenue.toFixed(2)}`} hint="confirmed only" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 text-lg font-semibold">Bookings · last 30 days</h2>
          <div className="flex h-40 items-end gap-1">
            {data.daily.map((d) => (
              <div
                key={d.date}
                className="flex-1 rounded-t bg-brand-500/70"
                style={{ height: `${(d.bookings / max) * 100}%` }}
                title={`${d.date}: ${d.bookings} bookings · $${d.revenue.toFixed(0)}`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            From {data.daily[0]?.date} to {data.daily.at(-1)?.date}
          </p>
        </div>

        <div className="card">
          <h2 className="mb-3 text-lg font-semibold">Top destinations</h2>
          {data.topDestinations.length === 0 ? (
            <p className="text-sm text-slate-500">No bookings yet.</p>
          ) : (
            <ul className="space-y-2">
              {data.topDestinations.map((t) => (
                <li key={t.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-xs text-slate-500">{t.destination}</p>
                  </div>
                  <span className="badge bg-brand-100 text-brand-700">{t.bookings} bookings</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Export data</h2>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-outline"
            onClick={() => download('/admin/dashboard/export/reservations.csv', 'reservations.csv')}
          >
            Download reservations CSV
          </button>
          <button
            className="btn-outline"
            onClick={() =>
              download('/admin/dashboard/export/reservations.xlsx', 'reservations.xlsx')
            }
          >
            Download reservations XLSX
          </button>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
