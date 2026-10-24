import api from './api';

export interface SaleItem {
  id?: string;
  medicineId: string;
  quantity: number;
  unitPrice: number;
  total?: number;
  medicine?: {
    id: string;
    name: string;
    unit?: string;
  };
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  patientId?: string;
  saleDate: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  status: string;
  notes?: string;
  patient?: {
    id: string;
    patientCode: string;
    fullName: string;
  };
  items: SaleItem[];
  saleType?: 'PRODUCT' | 'CONSULTANCY';
}

export interface CreateSaleData {
  patientId?: string;
  items: {
    medicineId: string;
    quantity: number;
    unitPrice: number;
  }[];
  discount?: number;
  tax?: number;
  paidAmount?: number;
  paymentMethod?: string;
  notes?: string;
}

export async function getSales(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const response = await api.get('/sales', { params });
  return response.data;
}

export async function createConsultancy(data: {
  patientId?: string;
  fee: number;
  paidAmount?: number;
  paymentMethod?: string;
  notes?: string;
}) {
  const response = await api.post('/sales/consultancy', data);
  return response.data.data as Sale;
}

export async function recordPayment(
  saleId: string,
  data: { amount: number; method: string; notes?: string },
) {
  const response = await api.post(`/sales/${saleId}/payments`, data);
  return response.data.data as Sale;
}

export async function getSale(id: string) {
  const response = await api.get(`/sales/${id}`);
  return response.data.data as Sale;
}

export async function createSale(data: CreateSaleData) {
  const response = await api.post('/sales', data);
  return response.data.data as Sale;
}
