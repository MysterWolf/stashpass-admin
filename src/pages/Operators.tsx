import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listOperators, createOperator } from '../api/operators';
import type { Operator } from '../types';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

function tierColor(tier: string): 'teal' | 'yellow' | 'gray' | 'blue' {
  if (tier === 'premium') return 'teal';
  if (tier === 'pending') return 'yellow';
  if (tier === 'standard') return 'blue';
  return 'gray';
}

const CATEGORIES = ['cannabis', 'coffee', 'barbershop', 'restaurant', 'retail', 'wellness', 'general'];
const TIERS = ['standard', 'premium', 'pending'];

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (op: Operator) => void }) {
  const [form, setForm] = useState({ name: '', city: '', state: '', category: 'cannabis', tier: 'standard' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function set(k: keyof typeof form, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setErr('Name is required.'); return; }
    setSaving(true);
    try {
      const { operator } = await createOperator({
        name: form.name.trim(),
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        category: form.category,
        tier: form.tier,
      });
      onCreated(operator);
    } catch (e) {
      setErr(String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="New Operator" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Name *</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">City</label>
            <input className="input" value={form.city} onChange={e => set('city', e.target.value)} />
          </div>
          <div>
            <label className="label">State</label>
            <input className="input" placeholder="NJ" value={form.state} onChange={e => set('state', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Tier</label>
            <select className="input" value={form.tier} onChange={e => set('tier', e.target.value)}>
              {TIERS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Creating…' : 'Create Operator'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Operators() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    listOperators()
      .then(r => setOperators(r.operators))
      .catch(e => setErr(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = operators.filter(op =>
    op.name.toLowerCase().includes(search.toLowerCase()) ||
    (op.city ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Operators</h1>
          <p className="text-muted text-sm mt-0.5">{operators.length} total</p>
        </div>
        <button className="btn-primary" onClick={() => setCreating(true)}>+ New Operator</button>
      </div>

      <input
        className="input max-w-xs"
        placeholder="Search by name or city…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : err ? (
        <div className="card text-red-400 text-sm">Error: {err}</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider hidden md:table-cell">Location</th>
                <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Tier</th>
                <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider hidden md:table-cell">Locations</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-10">No operators found.</td></tr>
              ) : (
                filtered.map(op => (
                  <tr
                    key={op.id}
                    className="border-b border-border hover:bg-bg/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/operators/${op.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-text">{op.name}</td>
                    <td className="px-4 py-3 text-muted hidden md:table-cell">
                      {[op.city, op.state].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted hidden md:table-cell">{op.category}</td>
                    <td className="px-4 py-3"><Badge label={op.tier} color={tierColor(op.tier)} /></td>
                    <td className="px-4 py-3 text-muted hidden md:table-cell">{op.location_count ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-teal text-xs">Edit →</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <CreateModal
          onClose={() => setCreating(false)}
          onCreated={op => {
            setOperators(prev => [op, ...prev]);
            setCreating(false);
            navigate(`/operators/${op.id}`);
          }}
        />
      )}
    </div>
  );
}
