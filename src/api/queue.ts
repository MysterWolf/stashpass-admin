import { api } from './client';
import type { StrainQueueItem } from '../types';

export const listStrainQueue = () =>
  api.get<{ items: StrainQueueItem[] }>('/queue/strains');

export const patchQueueItem = (
  id: string,
  body: { status?: StrainQueueItem['status']; strain_id?: string | null },
) => api.patch<{ item: StrainQueueItem }>(`/queue/strains/${id}`, body);
