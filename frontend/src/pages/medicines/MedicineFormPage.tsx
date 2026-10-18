import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createMedicine,
  getMedicine,
  updateMedicine,
  CreateMedicineData,
} from '../../services/medicines';

export default function MedicineFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    brand: '',
    unit: '',
    sku: '',
    description: '',
    reorderLevel: '10',
    purchasePrice: '',
    sellingPrice: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      getMedicine(id)
        .then((med) => {
          setForm({
            name: med.name || '',
            brand: med.brand || '',
            unit: med.unit || '',
            sku: med.sku || '',
            description: med.description || '',
            reorderLevel: med.reorderLevel?.toString() || '10',
            purchasePrice: med.purchasePrice?.toString() || '',
            sellingPrice: med.sellingPrice?.toString() || '',
          });
        })
        .catch(() => setError('Failed to load medicine'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload: CreateMedicineData = {
        name: form.name.trim(),
        brand: form.brand.trim() || undefined,
        unit: form.unit.trim() || undefined,
        sku: form.sku.trim() || undefined,
        description: form.description.trim() || undefined,
        reorderLevel: form.reorderLevel
          ? parseInt(form.reorderLevel, 10)
          : undefined,
        purchasePrice: form.purchasePrice
          ? parseFloat(form.purchasePrice)
          : undefined,
        sellingPrice: form.sellingPrice
          ? parseFloat(form.sellingPrice)
          : undefined,
      };

      if (isEdit && id) {
        await updateMedicine(id, payload);
      } else {
        await createMedicine(payload);
      }
      navigate('/medicines');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save medicine');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEdit ? 'Edit Medicine' : 'Add Medicine'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit ? 'Update medicine details' : 'Add a new medicine to the catalog'}
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Medicine Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Brand
            </label>
            <input
              name="brand"
              value={form.brand}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Unit
            </label>
            <input
              name="unit"
              value={form.unit}
              onChange={handleChange}
              placeholder="e.g. Tablet, Bottle, Pack"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              SKU
            </label>
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Reorder Level
            </label>
            <input
              name="reorderLevel"
              type="number"
              min="0"
              value={form.reorderLevel}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Purchase Price (₹)
            </label>
            <input
              name="purchasePrice"
              type="number"
              min="0"
              step="0.01"
              value={form.purchasePrice}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Selling Price (₹)
            </label>
            <input
              name="sellingPrice"
              type="number"
              min="0"
              step="0.01"
              value={form.sellingPrice}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-sarbloh-red text-white text-sm font-medium rounded-lg hover:bg-sarbloh-red-dark transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : isEdit ? 'Update Medicine' : 'Add Medicine'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/medicines')}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
