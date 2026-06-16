import { api } from './client';
import type { Strain } from '../types';

export const listStrains = (params?: { q?: string; type?: string }) => {
  const qs = new URLSearchParams();
  if (params?.q) qs.set('q', params.q);
  if (params?.type) qs.set('type', params.type);
  const s = qs.toString();
  return api.get<{ strains: Strain[] }>(`/strains${s ? `?${s}` : ''}`);
};

export const getStrain = (id: string) =>
  api.get<{ strain: Strain }>(`/strains/${id}`);

export const createStrain = (body: Partial<Strain>) =>
  api.post<{ strain: Strain }>('/strains', body);

export const updateStrain = (id: string, body: Partial<Strain>) =>
  api.put<{ strain: Strain }>(`/strains/${id}`, body);

export const deleteStrain = (id: string) =>
  api.delete<{ deleted: boolean }>(`/strains/${id}`);
