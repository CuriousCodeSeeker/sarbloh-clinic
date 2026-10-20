import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getSale, recordPayment, Sale } from '../../services/sales';

export default function SaleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [payError, setPayError] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!id) return;
    getSale(id)
      .then(setSale)
      .catch(() => setError('Sale not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sale) return;

    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) {
      setPayError('Enter a valid amount');
      return;
    }

    setPaying(true);
    setPayError('');
    try {
      const updated = await recordPayment(sale.id, {
        amount,
        method: payMethod,
      });
      setSale(updated);
      setPayAmount('');
    } catch (err: any) {
      setPayError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setPaying(false);
    }
  };

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

  const due = Number(sale.dueAmount);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link to="/sales" className="text-sm text-sarbloh-green hover:underline">
            ← Back to Sales
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">
            {sale.invoiceNumber}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{formatDate(sale.saleDate)}</p>
        </div>
        <button
          onClick={() => navigate(`/print/invoice/${sale.id}`)}
          className="px-4 py-2.5 bg-sarbloh-green text-white text-sm font-medium rounded-lg"
        >
          Print Invoice
        </button>
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
                <td className="py-2 text-gray-900">{item.medicine?.name || '—'}</td>
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

        {due > 0 && (
          <form onSubmit={handlePayment} className="mt-6 border-t border-gray-100 pt-5">
            <h3 className="text-sm font-medium text-gray-800 mb-3">Record Payment</h3>
            {payError && (
              <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded">
                {payError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder={`Due ${formatCurrency(due)}`}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
              />
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="OTHER">Other</option>
              </select>
              <button
                type="submit"
                disabled={paying}
                className="px-4 py-2 bg-sarbloh-green text-white text-sm font-medium rounded-lg disabled:opacity-60"
              >
                {paying ? 'Saving...' : 'Update Payment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}