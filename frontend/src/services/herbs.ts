import api from './api';

export interface HerbName {
  id?: string;
  languageCode: string;
  name: string;
}

export interface Herb {
  id: string;
  botanicalName?: string;
  commonName?: string;
  description?: string;
  benefits?: string;
  uses?: string;
  partsUsed?: string;
  preparation?: string;
  dosage?: string;
  contraindications?: string;
  names?: { languageCode: string; name: string }[];
  diseaseCategories?: {
    diseaseCategory: { id: string; name: string };
  }[];
}

export interface CreateHerbData {
  botanicalName?: string;
  commonName?: string;
  description?: string;
  benefits?: string;
  uses?: string;
  partsUsed?: string;
  preparation?: string;
  dosage?: string;
  contraindications?: string;
  names?: { languageCode: string; name: string }[];
}

export async function getHerbs(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const response = await api.get('/herbs', { params });
  return response.data;
}

export async function getHerb(id: string) {
  const response = await api.get(`/herbs/${id}`);
  return response.data.data as Herb;
}

export async function createHerb(data: CreateHerbData) {
  const response = await api.post('/herbs', data);
  return response.data.data as Herb;
}

export async function updateHerb(id: string, data: Partial<CreateHerbData>) {
  const response = await api.patch(`/herbs/${id}`, data);
  return response.data.data as Herb;
}

export async function deleteHerb(id: string) {
  const response = await api.delete(`/herbs/${id}`);
  return response.data;
}
