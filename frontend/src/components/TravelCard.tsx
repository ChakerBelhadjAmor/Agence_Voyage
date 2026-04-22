import Link from 'next/link';
import type { Travel } from '@/lib/types';

export function TravelCard({ travel }: { travel: Travel }) {
  const start = new Date(travel.startDate).toLocaleDateString();
  const end = new Date(travel.endDate).toLocaleDateString();
  return (
    <Link
      href={`/travels/${travel.id}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">
        {travel.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={travel.imageUrl}
            alt={travel.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">{travel.title}</h3>
            <p className="text-sm text-slate-500">{travel.destination}</p>
          </div>
          <p className="whitespace-nowrap text-base font-semibold text-brand-600">
            ${Number(travel.price).toFixed(0)}
          </p>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {start} → {end} · {travel.capacity} seats
        </p>
      </div>
    </Link>
  );
}
