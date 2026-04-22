'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api, apiErrorMessage } from '@/lib/api';
import type { PaginatedTravels, Travel } from '@/lib/types';

interface TravelForm {
  title: string;
  description: string;
  destination: string;
  price: number;
  startDate: string;
  endDate: string;
  capacity: number;
  imageUrl?: string;
  active: boolean;
}

const empty: TravelForm = {
  title: '',
  description: '',
  destination: '',
  price: 0,
  startDate: '',
  endDate: '',
  capacity: 10,
  imageUrl: '',
  active: true,
};

export default function AdminTravelsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Travel | null>(null);
  const [creating, setCreating] = useState(false);

  const list = useQuery({
    queryKey: ['admin-travels'],
    queryFn: async () =>
      (await api.get<PaginatedTravels>('/travels', {
        params: { includeInactive: true, pageSize: 100 },
      })).data,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/travels/${id}`),
    onSuccess: () => {
      toast.success('Travel deleted');
      qc.invalidateQueries({ queryKey: ['admin-travels'] });
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const duplicate = useMutation({
    mutationFn: async (id: string) => api.post(`/travels/${id}/duplicate`),
    onSuccess: () => {
      toast.success('Travel duplicated (inactive)');
      qc.invalidateQueries({ queryKey: ['admin-travels'] });
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="btn-primary" onClick={() => setCreating(true)}>
          New travel
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">Title</th>
              <th>Destination</th>
              <th>Dates</th>
              <th>Price</th>
              <th>Capacity</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.data?.items.map((t) => (
              <tr key={t.id} className="border-t border-slate-100">
                <td className="py-2 font-medium">{t.title}</td>
                <td>{t.destination}</td>
                <td>
                  {new Date(t.startDate).toLocaleDateString()} –{' '}
                  {new Date(t.endDate).toLocaleDateString()}
                </td>
                <td>${Number(t.price).toFixed(2)}</td>
                <td>{t.capacity}</td>
                <td>
                  <span
                    className={`badge ${t.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}
                  >
                    {t.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="space-x-2 whitespace-nowrap text-right">
                  <button className="btn-outline" onClick={() => setEditing(t)}>
                    Edit
                  </button>
                  <button className="btn-outline" onClick={() => duplicate.mutate(t.id)}>
                    Duplicate
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => {
                      if (confirm(`Delete "${t.title}"?`)) remove.mutate(t.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <TravelFormModal
          initial={editing ?? empty}
          mode={editing ? 'edit' : 'create'}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ['admin-travels'] });
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function toInputDate(v: string) {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

function TravelFormModal({
  initial,
  mode,
  onClose,
  onSaved,
}: {
  initial: Travel | TravelForm;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<TravelForm>({
    title: initial.title,
    description: initial.description,
    destination: initial.destination,
    price: Number(initial.price),
    startDate: toInputDate(initial.startDate as string),
    endDate: toInputDate(initial.endDate as string),
    capacity: initial.capacity,
    imageUrl: initial.imageUrl ?? '',
    active: initial.active,
  });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const payload = {
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        imageUrl: form.imageUrl || undefined,
      };
      if (mode === 'create') {
        await api.post('/travels', payload);
        toast.success('Travel created');
      } else {
        await api.patch(`/travels/${(initial as Travel).id}`, payload);
        toast.success('Travel updated');
      }
      onSaved();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">
          {mode === 'create' ? 'New travel' : `Edit · ${form.title}`}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">Title</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="label">Description</label>
            <textarea
              className="input h-24"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Destination</label>
            <input
              className="input"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Price ($)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="input"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label">Start date</label>
            <input
              type="date"
              className="input"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="label">End date</label>
            <input
              type="date"
              className="input"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Capacity</label>
            <input
              type="number"
              min={1}
              className="input"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label">Image URL</label>
            <input
              className="input"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </div>
          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Visible on the public catalog
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={busy} onClick={save}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
