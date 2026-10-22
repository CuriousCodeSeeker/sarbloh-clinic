import api from './api';

export interface DiseaseCategory {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  _count?: { herbs: number };
}

export async function getDiseaseCategories() {
  const res = await api.get('/disease-categories');
  return res.data.data as DiseaseCategory[];
}

export async function createDiseaseCategory(data: {
  name: string;
  description?: string;
}) {
  const res = await api.post('/disease-categories', data);
  return res.data.data as DiseaseCategory;
}

export async function updateDiseaseCategory(
  id: string,
  data: Partial<{ name: string; description: string; isActive: boolean }>,
) {
  const res = await api.patch(`/disease-categories/${id}`, data);
  return res.data.data as DiseaseCategory;
}

export async function deactivateDiseaseCategory(id: string) {
  const res = await api.delete(`/disease-categories/${id}`);
  return res.data.data;
}
