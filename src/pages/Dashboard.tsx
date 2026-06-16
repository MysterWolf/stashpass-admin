import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listOperators } from '../api/operators';
import { listStrains } from '../api/strains';
import type { Operator } from '../types';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card">
      <p className="text-muted text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold text-text">{value}</p>
      {sub && <p className="text-muted text-xs mt-1">{sub}</p>}
    </div>
  );
}

function tierColor(tier: string): 'teal' | 'yellow' | 'gray' | 'blue' {
  if (tier === 'premium') return 'teal';
  if (tier === 'pending') return 'yellow';
  if (tier === 'standard') return 'blue';
  return 'gray';
}

export default function Dashboard() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [strainCount, setStrainCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([listOperators(), listStrains()])
      .then(([ops, strains]) => {
        setOperators(ops.operators);
        setStrainCount(strains.strains.length);
      })
      .catch(e => setErr(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const pending = operators.filter(o => o.tier === 'pending').length;
  const recent = [...operators].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 8);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-muted text-sm mt-0.5">StashPass operator overview</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : err ? (
        <div className="card text-red-400 text-sm">Error: {err}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Operators" value={operators.length} />
            <StatCard label="Total Strains" value={strainCount} sub="API coming soon" />
            <StatCard label="Pending Queue" value={pending} sub="awaiting enrichment" />
            <StatCard
              label="Active"
              value={operators.filter(o => o.tier !== 'pending').length}
            />
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-text mb-4">Recently Added</h2>
            {recent.length === 0 ? (
              <p className="text-muted text-sm">No operators yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {recent.map(op => (
                  <div
                    key={op.id}
                    className="flex items-center justify-between py-3 cursor-pointer hover:bg-bg/40 -mx-5 px-5 transition-colors"
                    onClick={() => navigate(`/operators/${op.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium text-text">{op.name}</p>
                      <p className="text-xs text-muted">
                        {[op.city, op.state].filter(Boolean).join(', ') || 'No location'}
                        {' · '}
                        {op.category}
                      </p>
                    </div>
                    <Badge label={op.tier} color={tierColor(op.tier)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
