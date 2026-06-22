import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStrain, createStrain, updateStrain } from '../api/strains';
import type { Strain } from '../types';
import Spinner from '../components/Spinner';

const EFFECTS = ['relaxed', 'euphoric', 'creative', 'focused', 'sleepy', 'energetic', 'giggly'];
const USE_CASES = ['sleep', 'pain', 'anxiety', 'focus', 'social', 'appetite'];
const FLAVORS = ['sweet', 'citrus', 'earthy', 'diesel', 'pine', 'floral', 'spicy', 'berry'];
const METHODS = ['flower', 'vape', 'edible', 'concentrate', 'pre-roll'];
const TYPES: Strain['type'][] = ['sativa', 'indica', 'hybrid'];
const DOMINANCE_OPTIONS: { value: Strain['dominance']; label: string }[] = [
  { value: null, label: '(unset)' },
  { value: 'true_sativa', label: 'True Sativa' },
  { value: 'sativa_dominant', label: 'Sativa-dominant' },
  { value: 'balanced', label: 'Balanced Hybrid' },
  { value: 'indica_dominant', label: 'Indica-dominant' },
  { value: 'true_indica', label: 'True Indica' },
];

type StrainForm = Omit<Strain, 'id' | 'session_count' | 'created_at' | 'updated_at' | 'active'>;

const blank: StrainForm = {
  name: '', aliases: [], type: 'hybrid', lineage: null,
  thc_min: null, thc_max: null, cbd_min: null, cbd_max: null,
  terpenes: [], effects: [], use_cases: [], flavors: [],
  about: null, cautions: null, best_method: null, beginner_friendly: false,
  dominance: null,
};

function ChipSelector({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button
            key={o} type="button"
            onClick={() => onChange(selected.includes(o) ? selected.filter(x => x !== o) : [...selected, o])}
            className={`px-3 py-1 rounded-full text-sm border transition-colors capitalize ${
              selected.includes(o)
                ? 'border-teal bg-teal/10 text-teal'
                : 'border-border text-muted hover:border-muted'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function StrainEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [form, setForm] = useState<StrainForm>(blank);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSavedMsg] = useState(false);
  const [err, setErr] = useState('');
  const [aliasInput, setAliasInput] = useState('');
  const [terp, setTerp] = useState<{ name: string; effect: string }>({ name: '', effect: '' });
  const [editingName, setEditingName] = useState(false);
  const [nameForm, setNameForm] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameErr, setNameErr] = useState('');

  useEffect(() => {
    if (isNew || !id) return;
    getStrain(id)
      .then(r => setForm({
        name: r.strain.name,
        aliases: r.strain.aliases,
        type: r.strain.type,
        lineage: r.strain.lineage,
        thc_min: r.strain.thc_min != null ? parseFloat(String(r.strain.thc_min)) : null,
        thc_max: r.strain.thc_max != null ? parseFloat(String(r.strain.thc_max)) : null,
        cbd_min: r.strain.cbd_min != null ? parseFloat(String(r.strain.cbd_min)) : null,
        cbd_max: r.strain.cbd_max != null ? parseFloat(String(r.strain.cbd_max)) : null,
        terpenes: r.strain.terpenes,
        effects: r.strain.effects,
        use_cases: r.strain.use_cases,
        flavors: r.strain.flavors,
        about: r.strain.about,
        cautions: r.strain.cautions,
        best_method: r.strain.best_method,
        beginner_friendly: r.strain.beginner_friendly,
        dominance: r.strain.dominance ?? null,
      }))
      .catch(() => navigate('/strains'))
      .finally(() => setLoading(false));
  }, [id, isNew, navigate]);

  function set<K extends keyof StrainForm>(k: K, v: StrainForm[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function openNameEdit() {
    setNameForm(form.name);
    setNameErr('');
    setEditingName(true);
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!id || isNew || !nameForm.trim()) return;
    setNameSaving(true); setNameErr('');
    try {
      const { strain: updated } = await updateStrain(id, { name: nameForm.trim() });
      set('name', updated.name);
      setEditingName(false);
    } catch (e) {
      setNameErr(String(e));
    } finally {
      setNameSaving(false);
    }
  }

  function addAlias() {
    const trimmed = aliasInput.trim();
    if (!trimmed) return;
    // Support comma-separated input
    const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean);
    set('aliases', [...form.aliases, ...parts]);
    setAliasInput('');
  }

  function addTerpene() {
    if (!terp.name.trim()) return;
    set('terpenes', [...form.terpenes, { name: terp.name.trim(), effect: terp.effect.trim() }]);
    setTerp({ name: '', effect: '' });
  }

  function removeTerpene(idx: number) {
    set('terpenes', form.terpenes.filter((_, i) => i !== idx));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setErr('Name required.'); return; }
    setSaving(true); setErr(''); setSavedMsg(false);
    try {
      if (isNew) {
        const { strain } = await createStrain(form);
        navigate(`/strains/${strain.id}`, { replace: true });
      } else if (id) {
        await updateStrain(id, form);
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 3000);
      }
    } catch (e) {
      setErr(String(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate('/strains')} className="text-muted hover:text-text text-sm transition-colors">
        ← Strains
      </button>

      {isNew ? (
      <h1 className="text-2xl font-bold text-text">New Strain</h1>
    ) : editingName ? (
      <form onSubmit={saveName} className="flex items-center gap-2 flex-wrap">
        <input
          className="input py-1 text-sm"
          value={nameForm}
          onChange={e => setNameForm(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn-primary py-1 text-sm" disabled={nameSaving || !nameForm.trim()}>
          {nameSaving ? '…' : 'Save'}
        </button>
        <button type="button" className="btn-ghost py-1 text-sm" onClick={() => setEditingName(false)}>
          Cancel
        </button>
        {nameErr && <span className="text-red-400 text-xs">{nameErr}</span>}
      </form>
    ) : (
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-text">{form.name}</h1>
        <button className="text-teal hover:underline text-sm" onClick={openNameEdit}>edit name</button>
      </div>
    )}

      <form onSubmit={save} className="space-y-8">

        {/* ── Basic ─────────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider border-b border-border pb-2">Basic</h2>

          <div>
            <label className="label">Name *</label>
            <input
              className="input max-w-sm"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              autoFocus={isNew}
            />
          </div>

          <div>
            <label className="label">Type</label>
            <div className="flex gap-2">
              {TYPES.map(t => (
                <button
                  key={t} type="button"
                  onClick={() => set('type', t)}
                  className={`px-4 py-2 rounded-lg text-sm border transition-colors capitalize ${
                    form.type === t
                      ? 'border-teal bg-teal/10 text-teal font-medium'
                      : 'border-border text-muted hover:border-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Dominance</label>
            <select
              className="input max-w-xs"
              value={form.dominance ?? ''}
              onChange={e => set('dominance', (e.target.value || null) as Strain['dominance'])}
            >
              {DOMINANCE_OPTIONS.map(o => (
                <option key={String(o.value)} value={o.value ?? ''}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Aliases <span className="text-muted normal-case font-normal">(comma-separated or add individually)</span></label>
            <div className="flex gap-2 mb-2">
              <input
                className="input max-w-xs"
                value={aliasInput}
                onChange={e => setAliasInput(e.target.value)}
                placeholder="e.g. OG Kush, The OG"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAlias(); } }}
              />
              <button type="button" className="btn-ghost shrink-0" onClick={addAlias}>Add</button>
            </div>
            {form.aliases.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.aliases.map((a, i) => (
                  <span key={i} className="bg-border/60 text-text px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {a}
                    <button
                      type="button"
                      className="text-muted hover:text-red-400 transition-colors leading-none"
                      onClick={() => set('aliases', form.aliases.filter((_, j) => j !== i))}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="label">Lineage</label>
            <input
              className="input"
              placeholder="e.g. OG Kush × Durban Poison"
              value={form.lineage ?? ''}
              onChange={e => set('lineage', e.target.value || null)}
            />
          </div>
        </section>

        {/* ── Lab Data ──────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider border-b border-border pb-2">Lab Data</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {([
              ['thc_min', 'THC Min %'],
              ['thc_max', 'THC Max %'],
              ['cbd_min', 'CBD Min %'],
              ['cbd_max', 'CBD Max %'],
            ] as const).map(([k, lbl]) => (
              <div key={k}>
                <label className="label">{lbl}</label>
                <input
                  className="input"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={form[k] ?? ''}
                  onChange={e => set(k, e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Terpenes ──────────────────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider border-b border-border pb-2">Terpenes</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="input"
              placeholder="Terpene name (e.g. Myrcene)"
              value={terp.name}
              onChange={e => setTerp(t => ({ ...t, name: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTerpene(); } }}
            />
            <input
              className="input"
              placeholder="Effect note (e.g. relaxing)"
              value={terp.effect}
              onChange={e => setTerp(t => ({ ...t, effect: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTerpene(); } }}
            />
            <button type="button" className="btn-ghost shrink-0" onClick={addTerpene}>Add</button>
          </div>
          <div className="space-y-2">
            {form.terpenes.map((t, i) => (
              <div key={i} className="flex items-center justify-between bg-bg border border-border rounded-lg px-4 py-2.5">
                <div>
                  <span className="text-sm font-medium text-text">{t.name}</span>
                  {t.effect && <span className="text-xs text-muted ml-2">— {t.effect}</span>}
                </div>
                <button type="button" className="text-red-400 text-xs hover:underline ml-4" onClick={() => removeTerpene(i)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Effects & Use Cases ───────────────────────────────────────────── */}
        <section className="space-y-5">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider border-b border-border pb-2">Effects & Use Cases</h2>
          <ChipSelector
            label="Effects"
            options={EFFECTS}
            selected={form.effects}
            onChange={v => set('effects', v)}
          />
          <ChipSelector
            label="Use Cases"
            options={USE_CASES}
            selected={form.use_cases}
            onChange={v => set('use_cases', v)}
          />
          <ChipSelector
            label="Flavor Profile"
            options={FLAVORS}
            selected={form.flavors}
            onChange={v => set('flavors', v)}
          />
        </section>

        {/* ── Editorial ─────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider border-b border-border pb-2">Editorial</h2>

          <div>
            <label className="label">About</label>
            <textarea
              className="input h-32 resize-none"
              placeholder="Editorial description of this strain…"
              value={form.about ?? ''}
              onChange={e => set('about', e.target.value || null)}
            />
          </div>

          <div>
            <label className="label">Cautions / Side Effects</label>
            <textarea
              className="input h-20 resize-none"
              placeholder="e.g. dry mouth, paranoia at high doses, increased heart rate"
              value={form.cautions ?? ''}
              onChange={e => set('cautions', e.target.value || null)}
            />
          </div>

          <div>
            <label className="label">Best Method</label>
            <div className="flex flex-wrap gap-2">
              {METHODS.map(m => (
                <button
                  key={m} type="button"
                  onClick={() => set('best_method', form.best_method === m ? null : m)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors capitalize ${
                    form.best_method === m
                      ? 'border-teal bg-teal/10 text-teal font-medium'
                      : 'border-border text-muted hover:border-muted'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm text-text cursor-pointer">
            <input
              type="checkbox"
              className="accent-teal w-4 h-4"
              checked={form.beginner_friendly}
              onChange={e => set('beginner_friendly', e.target.checked)}
            />
            Beginner Friendly
          </label>
        </section>

        {/* ── AI Enrichment placeholder ─────────────────────────────────────── */}
        <section className="border border-dashed border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-muted mb-1">AI Enrichment</h2>
          <p className="text-xs text-muted mb-3">
            Auto-fill the intelligence profile using the spinup-strain-profile skill.
          </p>
          <button type="button" disabled className="btn-ghost opacity-40 text-xs cursor-not-allowed">
            Enrich with AI — coming soon
          </button>
        </section>

        {err && <p className="text-red-400 text-sm">{err}</p>}

        <div className="flex items-center gap-4 pb-10">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isNew ? 'Create Strain' : 'Save Changes'}
          </button>
          {saved && <span className="text-teal text-sm">Saved ✓</span>}
          <button type="button" className="btn-ghost ml-auto" onClick={() => navigate('/strains')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
