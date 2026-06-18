import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getOperator, getProfile, patchProfile, patchOperator,
  getLocations, addLocation, updateLocation, deleteLocation,
  replaceSpecials, deleteSpecial,
} from '../api/operators';
import type { Operator, OperatorProfile, OperatorLocation, Special } from '../types';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAYMENT_OPTIONS = ['Cash', 'Debit', 'Credit', 'CanPay', 'ACH', 'Check', 'ATM'];
const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

const CATEGORIES = ['cannabis', 'coffee', 'barbershop', 'restaurant', 'retail', 'wellness', 'liquor', 'general'];
const SUBCATEGORIES: Record<string, string[]> = {
  cannabis:    ['dispensary', 'smoke_shop', 'wellness_retail'],
  coffee:      ['cafe', 'coffee_shop'],
  barbershop:  ['barbershop', 'salon'],
  restaurant:  ['restaurant', 'bar'],
  retail:      ['general_retail', 'boutique'],
  wellness:    ['wellness_center', 'yoga_studio', 'gym'],
  liquor:      ['liquor_store'],
  general:     ['general'],
};

type Tab = 'profile' | 'brand' | 'locations' | 'specials';

// ─── Location Modal ───────────────────────────────────────────────────────────

function LocationModal({
  operatorId, loc, onClose, onSaved,
}: {
  operatorId: string;
  loc?: OperatorLocation;
  onClose: () => void;
  onSaved: (l: OperatorLocation) => void;
}) {
  const blank = { name: '', address: '', city: '', state: '', zip: '', phone: '', is_primary: false };
  const [form, setForm] = useState<typeof blank>(
    loc
      ? { name: loc.name, address: loc.address ?? '', city: loc.city ?? '', state: loc.state ?? '', zip: loc.zip ?? '', phone: loc.phone ?? '', is_primary: loc.is_primary }
      : blank
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function set<K extends keyof typeof blank>(k: K, v: (typeof blank)[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setErr('Name required.'); return; }
    setSaving(true);
    try {
      const body = {
        name: form.name,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        zip: form.zip || null,
        phone: form.phone || null,
        is_primary: form.is_primary,
      };
      const result = loc
        ? await updateLocation(operatorId, loc.id, body)
        : await addLocation(operatorId, body);
      onSaved(result.location);
    } catch (e) {
      setErr(String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={loc ? 'Edit Location' : 'Add Location'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Location Name *</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
        </div>
        <div>
          <label className="label">Address</label>
          <input className="input" value={form.address} onChange={e => set('address', e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="label">City</label>
            <input className="input" value={form.city} onChange={e => set('city', e.target.value)} />
          </div>
          <div>
            <label className="label">State</label>
            <input className="input" value={form.state} onChange={e => set('state', e.target.value)} />
          </div>
          <div>
            <label className="label">ZIP</label>
            <input className="input" value={form.zip} onChange={e => set('zip', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
          <input type="checkbox" checked={form.is_primary} onChange={e => set('is_primary', e.target.checked)} className="accent-teal" />
          Set as primary location
        </label>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Location'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Locations Tab ────────────────────────────────────────────────────────────

function LocationsTab({ operatorId }: { operatorId: string }) {
  const [locations, setLocations] = useState<OperatorLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<OperatorLocation | null | 'new'>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    getLocations(operatorId)
      .then(r => setLocations(r.locations))
      .finally(() => setLoading(false));
  }, [operatorId]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this location?')) return;
    setDeleting(id);
    try {
      await deleteLocation(operatorId, id);
      setLocations(prev => prev.filter(l => l.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted">{locations.length} location{locations.length !== 1 ? 's' : ''}</p>
        <button className="btn-primary" onClick={() => setEditing('new')}>+ Add Location</button>
      </div>

      {locations.length === 0 ? (
        <p className="text-muted text-sm py-6 text-center">No locations yet.</p>
      ) : (
        <div className="space-y-2">
          {locations.map(loc => (
            <div key={loc.id} className="flex items-start justify-between bg-bg border border-border rounded-lg px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text">{loc.name}</p>
                  {loc.is_primary && <Badge label="Primary" color="teal" />}
                </div>
                <p className="text-xs text-muted mt-0.5">
                  {[loc.address, loc.city, loc.state, loc.zip].filter(Boolean).join(', ') || 'No address'}
                </p>
                {loc.phone && <p className="text-xs text-muted">{loc.phone}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button className="text-xs text-teal hover:underline" onClick={() => setEditing(loc)}>Edit</button>
                <button
                  className="text-xs text-red-400 hover:underline disabled:opacity-50"
                  disabled={deleting === loc.id}
                  onClick={() => handleDelete(loc.id)}
                >
                  {deleting === loc.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <LocationModal
          operatorId={operatorId}
          loc={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={saved => {
            setLocations(prev => {
              const idx = prev.findIndex(l => l.id === saved.id);
              if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
              return [...prev, saved];
            });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Specials Tab ─────────────────────────────────────────────────────────────

function SpecialsTab({ operatorId }: { operatorId: string }) {
  const [specials, setSpecials] = useState<Special[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfile(operatorId)
      .then(r => setSpecials(r.profile?.specials ?? []))
      .finally(() => setLoading(false));
  }, [operatorId]);

  async function handleAdd() {
    if (!newItem.trim()) return;
    setSaving(true);
    try {
      const updated = [...specials, { item: newItem.trim(), description: newDesc.trim() }];
      const { profile } = await replaceSpecials(operatorId, updated);
      setSpecials(profile.specials ?? []);
      setNewItem(''); setNewDesc(''); setAdding(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const { profile } = await deleteSpecial(operatorId, id);
    setSpecials(profile.specials ?? []);
  }

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted">{specials.length} special{specials.length !== 1 ? 's' : ''}</p>
        <button className="btn-primary" onClick={() => setAdding(true)}>+ Add Special</button>
      </div>

      {adding && (
        <div className="bg-bg border border-border rounded-lg p-4 space-y-3">
          <div>
            <label className="label">Item *</label>
            <input className="input" placeholder="e.g. 20% off all edibles" value={newItem} onChange={e => setNewItem(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" placeholder="Optional details" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" disabled={saving || !newItem.trim()} onClick={handleAdd}>
              {saving ? 'Saving…' : 'Add'}
            </button>
            <button className="btn-ghost" onClick={() => { setAdding(false); setNewItem(''); setNewDesc(''); }}>Cancel</button>
          </div>
        </div>
      )}

      {specials.length === 0 && !adding ? (
        <p className="text-muted text-sm py-6 text-center">No specials this week.</p>
      ) : (
        <div className="space-y-2">
          {specials.map(s => (
            <div key={s.id} className="flex items-start justify-between bg-bg border border-border rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium text-text">{s.item}</p>
                {s.description && <p className="text-xs text-muted mt-0.5">{s.description}</p>}
              </div>
              <button className="text-xs text-red-400 hover:underline ml-4 shrink-0" onClick={() => handleDelete(s.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab({ operatorId }: { operatorId: string }) {
  const [profile, setProfileState] = useState<Partial<OperatorProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSavedMsg] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    getProfile(operatorId)
      .then(r => { if (r.profile) setProfileState(r.profile); })
      .finally(() => setLoading(false));
  }, [operatorId]);

  function set(k: keyof OperatorProfile, v: unknown) {
    setProfileState(p => ({ ...p, [k]: v }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr(''); setSavedMsg(false);
    try {
      // Use PUT (patch) so this tab only touches its own fields and never overwrites
      // brand colors / badges saved by BrandTab. Send all managed fields explicitly
      // (including null) so the user can clear fields. Coerce lat/lng to numbers —
      // pg returns NUMERIC as strings which Zod rejects as z.number().
      const cleanHours = profile.hours
        ? Object.fromEntries(Object.entries(profile.hours).filter(([, v]) => v.trim() !== ''))
        : null;

      const payload = {
        about: profile.about ?? null,
        hours: cleanHours && Object.keys(cleanHours).length ? cleanHours : null,
        website: profile.website ?? null,
        instagram: profile.instagram ?? null,
        leafly_url: profile.leafly_url ?? null,
        dutchie_url: profile.dutchie_url ?? null,
        other_ordering_url: profile.other_ordering_url ?? null,
        ordering_platform: profile.ordering_platform ?? null,
        payment_methods: profile.payment_methods?.length ? profile.payment_methods : null,
        lat: profile.lat != null && profile.lat !== '' ? parseFloat(String(profile.lat)) : null,
        lng: profile.lng != null && profile.lng !== '' ? parseFloat(String(profile.lng)) : null,
      };

      const { profile: updated } = await patchProfile(operatorId, payload as unknown as Partial<OperatorProfile>);
      setProfileState(updated);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (e) {
      setErr(String(e));
    } finally {
      setSaving(false);
    }
  }

  function togglePayment(m: string) {
    const cur = profile.payment_methods ?? [];
    set('payment_methods', cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m]);
  }

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <form onSubmit={save} className="space-y-6 max-w-2xl">
      <div>
        <label className="label">About</label>
        <textarea
          className="input h-28 resize-none"
          placeholder="Dispensary description…"
          value={profile.about ?? ''}
          onChange={e => set('about', e.target.value || null)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Website</label>
          <input className="input" type="url" placeholder="https://" value={profile.website ?? ''} onChange={e => set('website', e.target.value || null)} />
        </div>
        <div>
          <label className="label">Instagram</label>
          <input className="input" placeholder="@handle or URL" value={profile.instagram ?? ''} onChange={e => set('instagram', e.target.value || null)} />
        </div>
        <div>
          <label className="label">Leafly URL</label>
          <input className="input" type="url" placeholder="https://leafly.com/…" value={profile.leafly_url ?? ''} onChange={e => set('leafly_url', e.target.value || null)} />
        </div>
        <div>
          <label className="label">Dutchie URL</label>
          <input className="input" type="url" placeholder="https://dutchie.com/…" value={profile.dutchie_url ?? ''} onChange={e => set('dutchie_url', e.target.value || null)} />
        </div>
        <div>
          <label className="label">Other Ordering URL</label>
          <input className="input" type="url" value={profile.other_ordering_url ?? ''} onChange={e => set('other_ordering_url', e.target.value || null)} />
        </div>
        <div>
          <label className="label">Ordering Platform</label>
          <input className="input" placeholder="e.g. Tymber, Jane" value={profile.ordering_platform ?? ''} onChange={e => set('ordering_platform', e.target.value || null)} />
        </div>
      </div>

      <div>
        <label className="label">Lat / Lng (geo pin)</label>
        <div className="grid grid-cols-2 gap-3">
          <input className="input" type="number" step="any" placeholder="Latitude" value={profile.lat ?? ''} onChange={e => set('lat', e.target.value ? parseFloat(e.target.value) : null)} />
          <input className="input" type="number" step="any" placeholder="Longitude" value={profile.lng ?? ''} onChange={e => set('lng', e.target.value ? parseFloat(e.target.value) : null)} />
        </div>
      </div>

      <div>
        <label className="label">Payment Methods</label>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_OPTIONS.map(m => (
            <button
              key={m} type="button"
              onClick={() => togglePayment(m)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                (profile.payment_methods ?? []).includes(m)
                  ? 'border-teal bg-teal/10 text-teal'
                  : 'border-border text-muted hover:border-muted'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Hours</label>
        <div className="space-y-2">
          {DAYS.map(d => (
            <div key={d} className="flex items-center gap-3">
              <span className="text-xs text-muted w-20 capitalize">{d}</span>
              <input
                className="input"
                placeholder="e.g. 9am – 9pm or Closed"
                value={(profile.hours as Record<string, string> | null | undefined)?.[d] ?? ''}
                onChange={e => set('hours', { ...(profile.hours ?? {}), [d]: e.target.value })}
              />
            </div>
          ))}
        </div>
      </div>

      {err && <p className="text-red-400 text-sm">{err}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
        {saved && <span className="text-teal text-sm">Saved ✓</span>}
      </div>
    </form>
  );
}

// ─── Brand Tab ────────────────────────────────────────────────────────────────

function BrandTab({ operatorId }: { operatorId: string }) {
  const [profile, setProfileState] = useState<Partial<OperatorProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSavedMsg] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    getProfile(operatorId)
      .then(r => { if (r.profile) setProfileState(r.profile); })
      .finally(() => setLoading(false));
  }, [operatorId]);

  function set(k: keyof OperatorProfile, v: unknown) {
    setProfileState(p => ({ ...p, [k]: v }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr(''); setSavedMsg(false);
    try {
      const body: Partial<OperatorProfile> = {
        primary_color: profile.primary_color,
        secondary_color: profile.secondary_color,
        background_color: profile.background_color,
        logo_url: profile.logo_url,
        cover_image_url: profile.cover_image_url,
        black_owned: profile.black_owned,
        woman_owned: profile.woman_owned,
        lgbtq_friendly: profile.lgbtq_friendly,
        veteran_owned: profile.veteran_owned,
      };
      const { profile: updated } = await patchProfile(operatorId, body);
      setProfileState(updated);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (e) {
      setErr(String(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  const ColorField = ({ label, k }: { label: string; k: 'primary_color' | 'secondary_color' | 'background_color' }) => (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          className="w-10 h-10 rounded border border-border bg-bg"
          value={profile[k] ?? '#000000'}
          onChange={e => set(k, e.target.value)}
        />
        <input
          className="input"
          value={profile[k] ?? ''}
          onChange={e => set(k, e.target.value || null)}
          placeholder="#000000"
        />
      </div>
    </div>
  );

  const badges = [
    { key: 'black_owned' as const, label: 'Black Owned' },
    { key: 'woman_owned' as const, label: 'Woman Owned' },
    { key: 'lgbtq_friendly' as const, label: 'LGBTQ+ Friendly' },
    { key: 'veteran_owned' as const, label: 'Veteran Owned' },
  ];

  return (
    <form onSubmit={save} className="space-y-6 max-w-lg">
      <div className="grid grid-cols-1 gap-4">
        <ColorField label="Primary Color" k="primary_color" />
        <ColorField label="Secondary Color" k="secondary_color" />
        <ColorField label="Background Color" k="background_color" />
      </div>

      <div>
        <label className="label">Logo URL</label>
        <input className="input" type="url" value={profile.logo_url ?? ''} onChange={e => set('logo_url', e.target.value || null)} placeholder="https://" />
      </div>
      <div>
        <label className="label">Cover Image URL</label>
        <input className="input" type="url" value={profile.cover_image_url ?? ''} onChange={e => set('cover_image_url', e.target.value || null)} placeholder="https://" />
      </div>

      <div>
        <label className="label">Badges</label>
        <div className="grid grid-cols-2 gap-2">
          {badges.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input
                type="checkbox"
                className="accent-teal"
                checked={!!(profile[key])}
                onChange={e => set(key, e.target.checked)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {err && <p className="text-red-400 text-sm">{err}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Brand'}
        </button>
        {saved && <span className="text-teal text-sm">Saved ✓</span>}
      </div>
    </form>
  );
}

// ─── Main Edit Page ───────────────────────────────────────────────────────────

export default function OperatorEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('profile');
  const [editingName, setEditingName] = useState(false);
  const [nameForm, setNameForm] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameErr, setNameErr] = useState('');
  const [editingCategory, setEditingCategory] = useState(false);
  const [catForm, setCatForm] = useState({ category: '', subcategory: '' });
  const [catSaving, setCatSaving] = useState(false);
  const [catErr, setCatErr] = useState('');

  useEffect(() => {
    if (!id) return;
    getOperator(id)
      .then(r => setOperator(r.operator))
      .finally(() => setLoading(false));
  }, [id]);

  function openNameEdit() {
    if (!operator) return;
    setNameForm(operator.name);
    setNameErr('');
    setEditingName(true);
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !operator || !nameForm.trim()) return;
    setNameSaving(true); setNameErr('');
    try {
      const { operator: updated } = await patchOperator(id, { name: nameForm.trim() });
      setOperator(updated);
      setEditingName(false);
    } catch (e) {
      setNameErr(String(e));
    } finally {
      setNameSaving(false);
    }
  }

  function openCatEdit() {
    if (!operator) return;
    setCatForm({ category: operator.category, subcategory: operator.subcategory ?? '' });
    setCatErr('');
    setEditingCategory(true);
  }

  function setCatField(k: 'category' | 'subcategory', v: string) {
    setCatForm(f => {
      const next = { ...f, [k]: v };
      if (k === 'category') {
        const subs = SUBCATEGORIES[v] ?? [];
        next.subcategory = subs[0] ?? '';
      }
      return next;
    });
  }

  async function saveCat(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !operator) return;
    setCatSaving(true); setCatErr('');
    try {
      const { operator: updated } = await patchOperator(id, {
        category: catForm.category,
        subcategory: catForm.subcategory || null,
      });
      setOperator(updated);
      setEditingCategory(false);
    } catch (e) {
      setCatErr(String(e));
    } finally {
      setCatSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;
  if (!operator || !id) return <div className="text-muted p-8">Operator not found.</div>;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'brand', label: 'Brand & Badges' },
    { key: 'locations', label: 'Locations' },
    { key: 'specials', label: 'Specials' },
  ];

  const subcatOptions = SUBCATEGORIES[catForm.category] ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/operators')} className="text-muted hover:text-text transition-colors text-sm">← Operators</button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          {editingName ? (
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
              <h1 className="text-2xl font-bold text-text">{operator.name}</h1>
              <button className="text-teal hover:underline text-sm" onClick={openNameEdit}>edit name</button>
            </div>
          )}
          {editingCategory ? (
            <form onSubmit={saveCat} className="flex items-center gap-2 mt-2 flex-wrap">
              <select
                className="input py-1 text-sm"
                value={catForm.category}
                onChange={e => setCatField('category', e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select
                className="input py-1 text-sm"
                value={catForm.subcategory}
                onChange={e => setCatField('subcategory', e.target.value)}
              >
                {subcatOptions.map(s => <option key={s}>{s}</option>)}
              </select>
              <button type="submit" className="btn-primary py-1 text-sm" disabled={catSaving}>
                {catSaving ? '…' : 'Save'}
              </button>
              <button type="button" className="btn-ghost py-1 text-sm" onClick={() => setEditingCategory(false)}>
                Cancel
              </button>
              {catErr && <span className="text-red-400 text-xs">{catErr}</span>}
            </form>
          ) : (
            <p className="text-muted text-sm mt-0.5">
              {[operator.city, operator.state].filter(Boolean).join(', ') || 'No location set'}
              {' · '}{operator.category}{operator.subcategory ? ` / ${operator.subcategory}` : ''}{' · '}
              <span className="text-teal">{operator.tier}</span>
              {' · '}
              <button className="text-teal hover:underline" onClick={openCatEdit}>edit category</button>
            </p>
          )}
        </div>
      </div>

      <div className="border-b border-border flex gap-0">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-sm transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? 'border-teal text-teal font-medium'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === 'profile' && <ProfileTab operatorId={id} />}
        {tab === 'brand' && <BrandTab operatorId={id} />}
        {tab === 'locations' && <LocationsTab operatorId={id} />}
        {tab === 'specials' && <SpecialsTab operatorId={id} />}
      </div>
    </div>
  );
}
