import { api } from './client';
import type { Operator, OperatorProfile, OperatorLocation } from '../types';

// ── Operators ───────────────────────────────────────────────────────────────

export const listOperators = (params?: { tier?: string; category?: string }) => {
  const q = new URLSearchParams();
  if (params?.tier) q.set('tier', params.tier);
  if (params?.category) q.set('category', params.category);
  const qs = q.toString();
  return api.get<{ operators: Operator[] }>(`/operators${qs ? `?${qs}` : ''}`);
};

export const getOperator = (id: string) =>
  api.get<{ operator: Operator }>(`/operators/${id}`);

export const createOperator = (body: {
  name: string;
  city?: string;
  state?: string;
  category?: string;
  subcategory?: string;
  tier?: string;
}) => api.post<{ operator: Operator }>('/operators', body);

export const patchOperator = (id: string, body: {
  name?: string;
  city?: string | null;
  state?: string | null;
  category?: string;
  subcategory?: string | null;
  tier?: string;
}) => api.patch<{ operator: Operator }>(`/operators/${id}`, body);

// ── Profiles ────────────────────────────────────────────────────────────────

export const getProfile = (id: string) =>
  api.get<{ profile: (OperatorProfile & { locations: OperatorLocation[] }) | null }>(`/operators/${id}/profile`);

export const setProfile = (id: string, body: Partial<OperatorProfile>) =>
  api.post<{ profile: OperatorProfile }>(`/operators/${id}/profile`, body);

export const patchProfile = (id: string, body: Partial<OperatorProfile>) =>
  api.put<{ profile: OperatorProfile }>(`/operators/${id}/profile`, body);

// ── Specials ────────────────────────────────────────────────────────────────

export const replaceSpecials = (id: string, specials: { item: string; description?: string; id?: string; updated_at?: number }[]) =>
  api.post<{ profile: OperatorProfile }>(`/operators/${id}/specials`, { specials });

export const deleteSpecial = (id: string, specialId: string) =>
  api.delete<{ profile: OperatorProfile }>(`/operators/${id}/specials/${specialId}`);

// ── Locations ───────────────────────────────────────────────────────────────

export const getLocations = (id: string) =>
  api.get<{ locations: OperatorLocation[] }>(`/operators/${id}/locations`);

export const addLocation = (id: string, body: Partial<OperatorLocation>) =>
  api.post<{ location: OperatorLocation }>(`/operators/${id}/locations`, body);

export const updateLocation = (id: string, locationId: string, body: Partial<OperatorLocation>) =>
  api.put<{ location: OperatorLocation }>(`/operators/${id}/locations/${locationId}`, body);

export const deleteLocation = (id: string, locationId: string) =>
  api.delete<{ deleted: boolean }>(`/operators/${id}/locations/${locationId}`);
