import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listStrains, deleteStrain } from '../api/strains';
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
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const load = useCallback((q?: string) => {
    setLoading(true);
    listStrains(q ? { q } : undefined)
      .then(r => { setStrains(r.strains); setErr(''); })
      .catch(e => setErr(String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Debounce search — fire API call 300 ms after user stops typing
  useEffect(() => {
    const t = setTimeout(() => load(search || undefined), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await deleteStrain(id);
      setStrains(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      alert(String(e));
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Strains</h1>
          <p className="text-muted text-sm mt-0.5">{strains.length} total</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/strains/new')}>+ Add Strain</button>
      </div>

      <input
        className="input max-w-xs"
        placeholder="Search by name or alias…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {err && <div className="card text-red-400 text-sm">Error: {err}</div>}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider hidden md:table-cell">Sessions</th>
                <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider hidden md:table-cell">Added</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {strains.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-12">
                    {search ? 'No strains match your search.' : 'No strains yet. Add one above.'}
                  </td>
                </tr>
              ) : (
                strains.map(s => (
                  <tr
                    key={s.id}
                    className="border-b border-border hover:bg-bg/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/strains/${s.id}`)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-text">{s.name}</p>
                      {s.aliases.length > 0 && (
                        <p className="text-xs text-muted mt-0.5">{s.aliases.join(', ')}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={s.type} color={typeColor(s.type)} />
                    </td>
                    <td className="px-4 py-3 text-muted hidden md:table-cell">
                      {s.session_count}
                    </td>
                    <td className="px-4 py-3 text-muted hidden md:table-cell">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-3">
                        <button
                          className="text-teal text-xs hover:underline"
                          onClick={() => navigate(`/strains/${s.id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-400 text-xs hover:underline"
                          onClick={() => handleDelete(s.id, s.name)}
                        >
                          Delete
                        </button>
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
