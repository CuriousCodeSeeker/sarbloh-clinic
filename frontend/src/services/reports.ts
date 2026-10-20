import api from './api';

export interface ReportSummary {
  period: { from: string; to: string };
  patientsTotal: number;
  visitsInPeriod: number;
  visitsToday: number;
  salesCount: number;
  salesTotal: number;
  collected: number;
  outstandingAmount: number;
  outstandingInvoices: number;
  lowStockCount: number;
}

export interface SalesReportRow {
  id: string;
  invoiceNumber: string;
  saleDate: string;
  patientName: string;
  total: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: string;
  itemCount: number;
}

export interface LowStockRow {
  id: string;
  name: string;
  brand?: string;
  unit?: string;
  reorderLevel?: number;
  currentStock: number;
  needsReorder: boolean;
}

export async function getReportSummary(from?: string, to?: string) {
  const response = await api.get('/reports/summary', {
    params: { from, to },
  });
  return response.data.data as ReportSummary;
}

export async function getSalesReport(from?: string, to?: string) {
  const response = await api.get('/reports/sales', {
    params: { from, to },
  });
  return response.data.data as SalesReportRow[];
}

export async function getLowStockReport() {
  const response = await api.get('/reports/low-stock');
  return response.data.data as LowStockRow[];
}
