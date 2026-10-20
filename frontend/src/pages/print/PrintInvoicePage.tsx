import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSale, Sale } from '../../services/sales';
import { getSettings, ClinicSettings } from '../../services/settings';

export default function PrintInvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sale | null>(null);
  const [clinic, setClinic] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([getSale(id), getSettings()])
      .then(([saleData, settings]) => {
        setSale(saleData);
        setClinic(settings);
      })
      .catch(() => setError('Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [id]);

  const formatCurrency = (v: number | string) =>
    `₹${Number(v).toLocaleString('en-IN')}`;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  }

  if (error || !sale) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error || 'Not found'}</p>
        <button onClick={() => navigate(-1)} className="text-sarbloh-green">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="print:hidden max-w-3xl mx-auto px-4 py-4 flex gap-3">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-sarbloh-red text-white text-sm font-medium rounded-lg"
        >
          Print
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 text-sm rounded-lg bg-white"
        >
          Back
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-white shadow-sm print:shadow-none p-8 print:p-6 text-gray-900">
          <div className="text-center border-b border-gray-300 pb-4 mb-6">
  <img
    src="/sarbloh-logo.jpg"
    alt="Sarbloh"
    className="h-14 w-auto object-contain mx-auto"
  />
  {clinic?.clinic_address || clinic?.clinic_phone || clinic?.clinic_email ? (
    <p className="text-xs text-gray-500 mt-3">
      {[clinic?.clinic_address, clinic?.clinic_phone, clinic?.clinic_email]
        .filter(Boolean)
        .join(' · ')}
    </p>
  ) : null}
</div>

        <div className="flex justify-between text-sm mb-6">
          <div>
            <div className="text-gray-500">Bill To</div>
            <div className="font-semibold text-lg">
              {sale.patient?.fullName || 'Walk-in'}
            </div>
            {sale.patient?.patientCode && (
              <div className="text-gray-600">{sale.patient.patientCode}</div>
            )}
          </div>
          <div className="text-right">
            <div className="font-semibold">{sale.invoiceNumber}</div>
            <div className="text-gray-600">{formatDate(sale.saleDate)}</div>
            <div className="text-gray-600 mt-1">
              Status: {sale.paymentStatus}
            </div>
          </div>
        </div>

        <table className="w-full text-sm border-collapse mb-6">
          <thead>
            <tr className="border-b-2 border-gray-300 text-left">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Item</th>
              <th className="py-2 pr-2 text-right">Qty</th>
              <th className="py-2 pr-2 text-right">Price</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-2 pr-2">{i + 1}</td>
                <td className="py-2 pr-2 font-medium">
                  {item.medicine?.name || '—'}
                </td>
                <td className="py-2 pr-2 text-right">{Number(item.quantity)}</td>
                <td className="py-2 pr-2 text-right">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="py-2 text-right">
                  {formatCurrency(item.total ?? item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-56 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Discount</span>
              <span>{formatCurrency(sale.discount)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base border-t border-gray-300 pt-2 mt-2">
              <span>Total</span>
              <span>{formatCurrency(sale.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Paid</span>
              <span>{formatCurrency(sale.paidAmount)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Due</span>
              <span>{formatCurrency(sale.dueAmount)}</span>
            </div>
          </div>
        </div>

        {sale.notes && (
          <div className="text-sm mt-8 text-gray-600">
            Notes: {sale.notes}
          </div>
        )}

        <div className="mt-12 text-center text-xs text-gray-400">
          Thank you
        </div>
      </div>
    </div>
  );
}
