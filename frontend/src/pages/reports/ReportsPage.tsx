import React, { useEffect, useState } from 'react';
import {
  getReportSummary,
  getSalesReport,
  getLowStockReport,
  ReportSummary,
  SalesReportRow,
  LowStockRow,
} from '../../services/reports';

export default function ReportsPage() {
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const defaultTo = now.toISOString().slice(0, 10);

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [sales, setSales] = useState<SalesReportRow[]>([]);
  const [lowStock, setLowStock] = useState<LowStockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryData, salesData, lowStockData] = await Promise.all([
        getReportSummary(from, to),
        getSalesReport(from, to),
        getLowStockReport(),
      ]);
      setSummary(summaryData);
      setSales(salesData || []);
      setLowStock(lowStockData || []);
    } catch (err) {
      setError('Failed to load reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    loadReports();
  };

  const formatCurrency = (value: number) =>
    `₹${Number(value).toLocaleString('en-IN')}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Clinic and shop performance overview
        </p>
      </div>

      {/* Date filter */}
      <form
        onSubmit={handleApply}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end"
      >
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-sarbloh-green text-white text-sm font-medium rounded-lg hover:bg-sarbloh-green-dark transition-colors"
        >
          Apply
        </button>
      </form>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Patients',
            value: summary?.patientsTotal ?? '—',
            color: 'text-gray-800',
          },
          {
            label: 'Visits (period)',
            value: summary?.visitsInPeriod ?? '—',
            color: 'text-gray-800',
          },
          {
            label: 'Visits Today',
            value: summary?.visitsToday ?? '—',
            color: 'text-gray-800',
          },
          {
            label: 'Sales Count',
            value: summary?.salesCount ?? '—',
            color: 'text-gray-800',
          },
          {
            label: 'Sales Total',
            value: summary ? formatCurrency(summary.salesTotal) : '—',
            color: 'text-gray-800',
          },
          {
            label: 'Collected',
            value: summary ? formatCurrency(summary.collected) : '—',
            color: 'text-sarbloh-green',
          },
          {
            label: 'Outstanding',
            value: summary ? formatCurrency(summary.outstandingAmount) : '—',
            color: 'text-sarbloh-red',
          },
          {
            label: 'Low Stock Items',
            value: summary?.lowStockCount ?? '—',
            color: 'text-sarbloh-red',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
          >
            <div className="text-sm text-gray-500 font-medium">{card.label}</div>
            <div className={`text-2xl font-bold mt-2 ${card.color}`}>
              {loading ? '—' : card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Sales report */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">Sales in period</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Invoice</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Patient</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Paid</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Due</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  No sales in this period
                </td>
              </tr>
            ) : (
              sales.map((row) => (
                <tr key={row.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-sarbloh-green">
                    {row.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(row.saleDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{row.patientName}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(row.total)}</td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(row.paidAmount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(row.dueAmount)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.paymentStatus}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Low stock */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">Low stock medicines</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Medicine</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Brand</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Reorder Level</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : lowStock.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  No low stock items
                </td>
              </tr>
            ) : (
              lowStock.map((row) => (
                <tr key={row.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                  <td className="px-4 py-3 text-gray-600">{row.brand || '—'}</td>
                  <td className="px-4 py-3 text-right text-sarbloh-red font-medium">
                    {row.currentStock}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {row.reorderLevel ?? '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}