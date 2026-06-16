import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listStrains, deleteStrain, STRAINS_STUB } from '../api/strains';
import type { Strain } from '../types';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';

function typeColor(type: string): 'teal' | 'purple' | 'yellow' {
  if (type === 'sativa') return 'yellow';
  if (type === 'indica') return 'purple';
  return 'teal';
}

export default function Strains() {
  const [strains, setStrains] = useState<Strain[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    listStrains()
      .then(r => setStrains(r.strains))
      .finally(() => setLoading(false));
  }, []);

  const filtered = strains.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await deleteStrain(id);
    setStrains(prev => prev.filter(s => s.id !== id));
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Strains</h1>
          <p className="text-muted text-sm mt-0.5">{strains.length} total</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/strains/new')}>+ New Strain</button>
      </div>

      {STRAINS_STUB && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 text-sm text-yellow-400">
          Strains API not yet built on the backend — data is session-only and will not persist. Build <code className="font-mono">/strains</code> routes in stashpass-api to activate.
        </div>
      )}

      <input
        className="input max-w-xs"
        placeholder="Search strains…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider hidden md:table-cell">THC</th>
                <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider hidden md:table-cell">Effects</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted py-10">No strains yet. Add one above.</td></tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.id} className="border-b border-border hover:bg-bg/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-text">{s.name}</td>
                    <td className="px-4 py-3"><Badge label={s.type} color={typeColor(s.type)} /></td>
                    <td className="px-4 py-3 text-muted hidden md:table-cell">
                      {s.thc_min != null && s.thc_max != null ? `${s.thc_min}–${s.thc_max}%` : s.thc_min != null ? `${s.thc_min}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted hidden md:table-cell">
                      {s.effects.slice(0, 3).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <button className="text-teal text-xs hover:underline" onClick={() => navigate(`/strains/${s.id}`)}>Edit</button>
                        <button className="text-red-400 text-xs hover:underline" onClick={() => handleDelete(s.id, s.name)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
