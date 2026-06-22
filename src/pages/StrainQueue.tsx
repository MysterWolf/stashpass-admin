import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listStrainQueue, patchQueueItem } from '../api/queue';
import type { StrainQueueItem } from '../types';
import Spinner from '../components/Spinner';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_BADGE: Record<StrainQueueItem['status'], string> = {
  pending:   'bg-amber-500/20 text-amber-400',
  enriching: 'bg-teal/20 text-teal',
  published: 'bg-green-500/20 text-green-400',
  rejected:  'bg-red-500/20 text-red-400',
};

export default function StrainQueue() {
  const [items, setItems] = useState<StrainQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    listStrainQueue()
      .then(r => setItems(r.items))
      .catch(e => setErr(String(e)))
      .finally(() => setLoading(false));
  }, []);

  async function enrich(item: StrainQueueItem) {
    setBusy(item.id);
    try {
      await patchQueueItem(item.id, { status: 'enriching' });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'enriching' } : i));
      const params = new URLSearchParams({
        queue_id: item.id,
        qname: item.name,
        ...(item.type ? { qtype: item.type } : {}),
      });
      navigate(`/strains/new?${params.toString()}`);
    } catch (e) {
      alert(String(e));
    } finally {
      setBusy(null);
    }
  }

  async function reject(item: StrainQueueItem) {
    if (!confirm(`Reject "${item.name}"? This removes it from the queue.`)) return;
    setBusy(item.id);
    try {
      await patchQueueItem(item.id, { status: 'rejected' });
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (e) {
      alert(String(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Strain Discovery Queue</h1>
        <p className="text-muted text-sm mt-0.5">
          Unknown strains surfaced by CannaGuide devices, sorted by demand
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : err ? (
        <div className="card text-red-400 text-sm">Error: {err}</div>
      ) : items.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">✓</p>
          <p className="text-text font-medium">Queue is clear</p>
          <p className="text-muted text-sm mt-1">No pending strains to enrich.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Strain Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider text-center">Demand</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">First Seen</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-border/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-text">{item.name}</td>
                  <td className="px-4 py-3 text-muted capitalize">{item.type ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full bg-teal/10 text-teal font-bold text-sm">
                      {item.surface_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(item.surfaced_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge capitalize ${STATUS_BADGE[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        className="btn-primary text-xs px-3 py-1.5"
                        disabled={busy === item.id}
                        onClick={() => enrich(item)}
                      >
                        {busy === item.id ? '…' : 'Enrich'}
                      </button>
                      <button
                        className="btn-ghost text-xs px-3 py-1.5 hover:text-red-400"
                        disabled={busy === item.id}
                        onClick={() => reject(item)}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
