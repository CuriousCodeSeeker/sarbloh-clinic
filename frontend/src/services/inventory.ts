import api from './api';

export interface StockItem {
  id: string;
  type: 'MEDICINE' | 'HERB';
  name: string;
  brand?: string | null;
  unit?: string | null;
  sku?: string | null;
  reorderLevel?: number | null;
  currentStock: number;
  needsReorder: boolean;
}

export async function getStockLevels(search?: string) {
  const res = await api.get('/inventory/stock', {
    params: search ? { search } : undefined,
  });
  return res.data.data as StockItem[];
}

export async function getHerbStockLevels(search?: string) {
  const res = await api.get('/inventory/herbs/stock', {
    params: search ? { search } : undefined,
  });
  return res.data.data as StockItem[];
}

export async function adjustStock(data: {
  medicineId?: string;
  herbId?: string;
  transactionType: string;
  quantity: number;
  notes?: string;
}) {
  const res = await api.post('/inventory/adjust', data);
  return res.data.data;
}