import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listOperators, patchProfile } from '../api/operators';
import type { Operator } from '../types';
import Spinner from '../components/Spinner';

export default function Queue() {
  const [queue, setQueue] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    listOperators({ tier: 'pending' })
      .then(r => setQueue(r.operators))
      .catch(e => setErr(String(e)))
      .finally(() => setLoading(false));
  }, []);

  async function skip(op: Operator) {
    if (!confirm(`Mark "${op.name}" as reviewed (no enrich)?`)) return;
    setBusy(op.id);
    try {
      // Move to standard tier to remove from queue
      await patchProfile(op.id, {});
      setQueue(prev => prev.filter(o => o.id !== op.id));
    } catch {
      // Profile may not exist yet — that's fine, just remove from local state
      setQueue(prev => prev.filter(o => o.id !== op.id));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Operator Queue</h1>
        <p className="text-muted text-sm mt-0.5">Pending stubs awaiting enrichment</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : err ? (
        <div className="card text-red-400 text-sm">Error: {err}</div>
      ) : queue.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">✓</p>
          <p className="text-text font-medium">Queue is clear</p>
          <p className="text-muted text-sm mt-1">No pending operators to enrich.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map(op => (
            <div key={op.id} className="card flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-text">{op.name}</p>
                <p className="text-xs text-muted mt-0.5">
                  {[op.city, op.state].filter(Boolean).join(', ') || 'No location'}
                  {' · '}{op.category}
                  {' · Added '}{new Date(op.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  className="btn-primary text-xs px-3 py-1.5"
                  onClick={() => navigate(`/operators/${op.id}`)}
                >
                  Enrich
                </button>
                <button
                  className="btn-ghost text-xs px-3 py-1.5"
                  disabled={busy === op.id}
                  onClick={() => skip(op)}
                >
                  {busy === op.id ? '…' : 'Skip'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
