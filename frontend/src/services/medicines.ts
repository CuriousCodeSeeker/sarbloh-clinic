import api from './api';

export interface Medicine {
  id: string;
  name: string;
  brand?: string;
  unit?: string;
  sku?: string;
  description?: string;
  reorderLevel?: number;
  purchasePrice?: number;
  sellingPrice?: number;
  category?: { id: string; name: string };
  isActive?: boolean;
  createdAt?: string;
}

export interface CreateMedicineData {
  name: string;
  brand?: string;
  unit?: string;
  sku?: string;
  description?: string;
  reorderLevel?: number;
  purchasePrice?: number;
  sellingPrice?: number;
  categoryId?: string;
}

export async function getMedicines(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const response = await api.get('/medicines', { params });
  return response.data;
}

export async function getMedicine(id: string) {
  const response = await api.get(`/medicines/${id}`);
  return response.data.data as Medicine;
}

export async function createMedicine(data: CreateMedicineData) {
  const response = await api.post('/medicines', data);
  return response.data.data as Medicine;
}

export async function updateMedicine(id: string, data: Partial<CreateMedicineData>) {
  const response = await api.patch(`/medicines/${id}`, data);
  return response.data.data as Medicine;
}

export async function deleteMedicine(id: string) {
  const response = await api.delete(`/medicines/${id}`);
  return response.data;
}
