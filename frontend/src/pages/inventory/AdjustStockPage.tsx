import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adjustStock } from '../../services/inventory';
import { getMedicines, Medicine } from '../../services/medicines';

export default function AdjustStockPage() {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    medicineId: '',
    transactionType: 'PURCHASE',
    quantity: '',
    notes: '',
  });

  useEffect(() => {
    getMedicines({ limit: 100 })
      .then((result) => setMedicines(result.data || []))
      .catch(() => setError('Failed to load medicines'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.medicineId) {
      setError('Select a medicine');
      return;
    }

    const qty = parseFloat(form.quantity);
    if (!qty || qty <= 0) {
      setError('Enter a valid quantity greater than 0');
      return;
    }

    setSaving(true);
    try {
      await adjustStock({
        medicineId: form.medicineId,
        transactionType: form.transactionType,
        quantity: qty,
        notes: form.notes.trim() || undefined,
      });
      setSuccess('Stock updated successfully');
      setForm((prev) => ({ ...prev, quantity: '', notes: '' }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/inventory')}
          className="text-sm text-sarbloh-green hover:underline"
        >
          ← Back to Inventory
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">
          Adjust Stock
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Add stock (purchase) or reduce stock (sale, damage, expired)
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Medicine <span className="text-red-500">*</span>
          </label>
          <select
            name="medicineId"
            value={form.medicineId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
          >
            <option value="">Select medicine</option>
            {medicines.map((med) => (
              <option key={med.id} value={med.id}>
                {med.name}
                {med.brand ? ` (${med.brand})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Transaction Type <span className="text-red-500">*</span>
          </label>
          <select
            name="transactionType"
            value={form.transactionType}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
          >
            <option value="PURCHASE">Purchase (Stock In)</option>
            <option value="RETURN">Return (Stock In)</option>
            <option value="ADJUSTMENT">Adjustment (Stock In)</option>
            <option value="SALE">Sale (Stock Out)</option>
            <option value="DAMAGE">Damage (Stock Out)</option>
            <option value="EXPIRED">Expired (Stock Out)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            name="quantity"
            type="number"
            min="0.01"
            step="0.01"
            value={form.quantity}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Notes
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-sarbloh-red text-white text-sm font-medium rounded-lg hover:bg-sarbloh-red-dark transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Update Stock'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}