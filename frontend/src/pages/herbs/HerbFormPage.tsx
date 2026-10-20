import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createHerb,
  getHerb,
  updateHerb,
  CreateHerbData,
} from '../../services/herbs';

export default function HerbFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    botanicalName: '',
    commonName: '',
    nameEn: '',
    nameHi: '',
    namePa: '',
    description: '',
    benefits: '',
    uses: '',
    partsUsed: '',
    preparation: '',
    dosage: '',
    contraindications: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      getHerb(id)
        .then((herb) => {
          const nameEn =
            herb.names?.find((n) => n.languageCode === 'en')?.name || '';
          const nameHi =
            herb.names?.find((n) => n.languageCode === 'hi')?.name || '';
          const namePa =
            herb.names?.find((n) => n.languageCode === 'pa')?.name || '';
          setForm({
            botanicalName: herb.botanicalName || '',
            commonName: herb.commonName || '',
            nameEn,
            nameHi,
            namePa,
            description: herb.description || '',
            benefits: herb.benefits || '',
            uses: herb.uses || '',
            partsUsed: herb.partsUsed || '',
            preparation: herb.preparation || '',
            dosage: herb.dosage || '',
            contraindications: herb.contraindications || '',
          });
        })
        .catch(() => setError('Failed to load herb'))
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
      const names: { languageCode: string; name: string }[] = [];
      if (form.nameEn.trim())
        names.push({ languageCode: 'en', name: form.nameEn.trim() });
      if (form.nameHi.trim())
        names.push({ languageCode: 'hi', name: form.nameHi.trim() });
      if (form.namePa.trim())
        names.push({ languageCode: 'pa', name: form.namePa.trim() });

      const payload: CreateHerbData = {
        botanicalName: form.botanicalName.trim() || undefined,
        commonName:
          form.commonName.trim() || form.nameEn.trim() || undefined,
        description: form.description.trim() || undefined,
        benefits: form.benefits.trim() || undefined,
        uses: form.uses.trim() || undefined,
        partsUsed: form.partsUsed.trim() || undefined,
        preparation: form.preparation.trim() || undefined,
        dosage: form.dosage.trim() || undefined,
        contraindications: form.contraindications.trim() || undefined,
        names: names.length ? names : undefined,
      };

      if (isEdit && id) {
        await updateHerb(id, payload);
        navigate(`/herbs/${id}`);
      } else {
        const herb = await createHerb(payload);
        navigate(`/herbs/${herb.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save herb');
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
          {isEdit ? 'Edit Herb' : 'Add Herb'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Multilingual herb entry
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Name (English)
            </label>
            <input
              name="nameEn"
              value={form.nameEn}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Name (Hindi)
            </label>
            <input
              name="nameHi"
              value={form.nameHi}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Name (Punjabi)
            </label>
            <input
              name="namePa"
              value={form.namePa}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Botanical Name
            </label>
            <input
              name="botanicalName"
              value={form.botanicalName}
              onChange={handleChange}
              placeholder="e.g. Withania somnifera"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Common Name
            </label>
            <input
              name="commonName"
              value={form.commonName}
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
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Benefits
            </label>
            <textarea
              name="benefits"
              value={form.benefits}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Uses
            </label>
            <textarea
              name="uses"
              value={form.uses}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Parts Used
            </label>
            <input
              name="partsUsed"
              value={form.partsUsed}
              onChange={handleChange}
              placeholder="e.g. Root, Leaf"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Dosage
            </label>
            <input
              name="dosage"
              value={form.dosage}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Preparation
            </label>
            <textarea
              name="preparation"
              value={form.preparation}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Contraindications
            </label>
            <textarea
              name="contraindications"
              value={form.contraindications}
              onChange={handleChange}
              rows={2}
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
            {saving ? 'Saving...' : isEdit ? 'Update Herb' : 'Add Herb'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
