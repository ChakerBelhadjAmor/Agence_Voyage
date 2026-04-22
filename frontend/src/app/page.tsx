'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TravelCard } from '@/components/TravelCard';
import type { PaginatedTravels } from '@/lib/types';

interface Filters {
  destination?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  startAfter?: string;
}

export default function HomePage() {
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['travels', filters, page],
    queryFn: async () => {
      const params: Record<string, any> = { page, pageSize: 12 };
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== '' && v != null) params[k] = v;
      });
      const { data } = await api.get<PaginatedTravels>('/travels', { params });
      return data;
    },
    placeholderData: (prev) => prev,
  });

  const onChange = (k: keyof Filters, v: string) => {
    setPage(1);
    setFilters((f) => ({ ...f, [k]: v === '' ? undefined : k.includes('Price') ? Number(v) : v }));
  };

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="mb-1 text-2xl font-bold">Find your next trip</h1>
        <p className="mb-4 text-sm text-slate-500">
          Browse curated destinations and book your seat in seconds.
        </p>
        <div className="grid gap-3 md:grid-cols-5">
          <input
            className="input md:col-span-2"
            placeholder="Search title, description…"
            onChange={(e) => onChange('search', e.target.value)}
          />
          <input
            className="input"
            placeholder="Destination"
            onChange={(e) => onChange('destination', e.target.value)}
          />
          <input
            className="input"
            type="number"
            placeholder="Min price"
            onChange={(e) => onChange('minPrice', e.target.value)}
          />
          <input
            className="input"
            type="number"
            placeholder="Max price"
            onChange={(e) => onChange('maxPrice', e.target.value)}
          />
          <input
            className="input md:col-span-2"
            type="date"
            onChange={(e) => onChange('startAfter', e.target.value)}
          />
        </div>
      </section>

      {query.isLoading ? (
        <p className="text-slate-500">Loading…</p>
      ) : query.isError ? (
        <p className="text-red-600">Failed to load travels.</p>
      ) : query.data && query.data.items.length === 0 ? (
        <p className="text-slate-500">No travels match your filters.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {query.data?.items.map((t) => (
              <TravelCard key={t.id} travel={t} />
            ))}
          </div>
          {query.data && query.data.total > query.data.pageSize && (
            <Pagination
              page={page}
              total={query.data.total}
              pageSize={query.data.pageSize}
              onChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}

function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
}) {
  const last = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        className="btn-outline"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </button>
      <span className="text-sm text-slate-600">
        Page {page} of {last}
      </span>
      <button
        className="btn-outline"
        disabled={page >= last}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
