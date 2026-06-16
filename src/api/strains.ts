// Strains API — endpoints not yet built on the backend.
// These functions stub the expected shape; wire up when the API is ready.
import type { Strain } from '../types';

export const STRAINS_STUB = true;

const MOCK_STRAINS: Strain[] = [];

export const listStrains = async (): Promise<{ strains: Strain[] }> =>
  Promise.resolve({ strains: MOCK_STRAINS });

export const getStrain = async (id: string): Promise<{ strain: Strain }> => {
  const s = MOCK_STRAINS.find(s => s.id === id);
  if (!s) throw new Error('Not found');
  return { strain: s };
};

export const createStrain = async (body: Partial<Strain>): Promise<{ strain: Strain }> => {
  const s: Strain = {
    id: crypto.randomUUID(),
    name: body.name ?? '',
    aliases: body.aliases ?? [],
    type: body.type ?? 'hybrid',
    lineage: body.lineage ?? null,
    thc_min: body.thc_min ?? null,
    thc_max: body.thc_max ?? null,
    cbd_min: body.cbd_min ?? null,
    cbd_max: body.cbd_max ?? null,
    terpenes: body.terpenes ?? [],
    effects: body.effects ?? [],
    use_cases: body.use_cases ?? [],
    flavors: body.flavors ?? [],
    about: body.about ?? null,
    cautions: body.cautions ?? null,
    best_method: body.best_method ?? null,
    beginner_friendly: body.beginner_friendly ?? false,
    session_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  MOCK_STRAINS.push(s);
  return { strain: s };
};

export const updateStrain = async (id: string, body: Partial<Strain>): Promise<{ strain: Strain }> => {
  const idx = MOCK_STRAINS.findIndex(s => s.id === id);
  if (idx === -1) throw new Error('Not found');
  MOCK_STRAINS[idx] = { ...MOCK_STRAINS[idx]!, ...body, updated_at: new Date().toISOString() };
  return { strain: MOCK_STRAINS[idx]! };
};

export const deleteStrain = async (id: string): Promise<void> => {
  const idx = MOCK_STRAINS.findIndex(s => s.id === id);
  if (idx !== -1) MOCK_STRAINS.splice(idx, 1);
};
