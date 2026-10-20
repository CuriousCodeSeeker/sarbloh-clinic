import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSale, Sale } from '../../services/sales';

export default function SaleDetailPage() {
  const { id } = useParams();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getSale(id)
      .then(setSale)
      .catch(() => setError('Sale not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  if (error || !sale) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Sale not found'}</p>
        <Link to="/sales" className="text-sarbloh-green hover:underline">
          Back to Sales
        </Link>
      </div>
    );
  }

  const formatCurrency = (value: number | string) =>
    `₹${Number(value).toLocaleString('en-IN')}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link to="/sales" className="text-sm text-sarbloh-green hover:underline">
          ← Back to Sales
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">
          {sale.invoiceNumber}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {formatDate(sale.saleDate)}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <div className="text-gray-500">Patient</div>
            <div className="font-medium text-gray-900 mt-0.5">
              {sale.patient?.fullName || 'Walk-in'}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Payment Status</div>
            <div className="font-medium text-gray-900 mt-0.5">
              {sale.paymentStatus}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Payment Method</div>
            <div className="font-medium text-gray-900 mt-0.5">
              {sale.paymentMethod || '—'}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Status</div>
            <div className="font-medium text-gray-900 mt-0.5">{sale.status}</div>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="pb-2 font-medium">Medicine</th>
              <th className="pb-2 font-medium text-right">Qty</th>
              <th className="pb-2 font-medium text-right">Price</th>
              <th className="pb-2 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-2 text-gray-900">
                  {item.medicine?.name || '—'}
                </td>
                <td className="py-2 text-right text-gray-700">
                  {Number(item.quantity)}
                </td>
                <td className="py-2 text-right text-gray-700">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="py-2 text-right text-gray-900">
                  {formatCurrency(item.total ?? item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 border-t border-gray-100 pt-4 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(sale.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Discount</span>
            <span>{formatCurrency(sale.discount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 text-base pt-1">
            <span>Total</span>
            <span>{formatCurrency(sale.total)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Paid</span>
            <span>{formatCurrency(sale.paidAmount)}</span>
          </div>
          <div className="flex justify-between text-sarbloh-red font-medium">
            <span>Due</span>
            <span>{formatCurrency(sale.dueAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
