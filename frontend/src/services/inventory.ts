import api from './api';

export interface StockItem {
  id: string;
  name: string;
  brand?: string;
  unit?: string;
  sku?: string;
  reorderLevel?: number;
  sellingPrice?: number;
  currentStock: number;
  needsReorder: boolean;
}

export interface InventoryTransaction {
  id: string;
  medicineId: string;
  transactionType: string;
  quantity: number;
  notes?: string;
  createdAt: string;
  medicine?: {
    id: string;
    name: string;
    unit?: string;
  };
  createdBy?: {
    id: string;
    fullName: string;
  };
}

export async function getStockLevels(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const response = await api.get('/inventory/stock', { params });
  return response.data;
}

export async function adjustStock(data: {
  medicineId: string;
  transactionType: string;
  quantity: number;
  notes?: string;
}) {
  const response = await api.post('/inventory/adjust', data);
  return response.data.data;
}

export async function getTransactions(params?: {
  page?: number;
  limit?: number;
  medicineId?: string;
}) {
  const response = await api.get('/inventory/transactions', { params });
  return response.data;
}
