import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createHerb, getHerb, updateHerb } from '../../services/herbs';
import {
  createDiseaseCategory,
  getDiseaseCategories,
  DiseaseCategory,
} from '../../services/diseaseCategories';

export default function HerbFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [english, setEnglish] = useState('');
  const [hindi, setHindi] = useState('');
  const [punjabi, setPunjabi] = useState('');
  const [botanicalName, setBotanicalName] = useState('');
  const [commonName, setCommonName] = useState('');
  const [description, setDescription] = useState('');
  const [benefits, setBenefits] = useState('');
  const [uses, setUses] = useState('');
  const [partsUsed, setPartsUsed] = useState('');
  const [preparation, setPreparation] = useState('');
  const [dosage, setDosage] = useState('');
  const [contraindications, setContraindications] = useState('');

  const [categories, setCategories] = useState<DiseaseCategory[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  useEffect(() => {
    getDiseaseCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    getHerb(id)
      .then((herb) => {
        setEnglish(herb.names?.find((n) => n.languageCode === 'en')?.name || '');
        setHindi(herb.names?.find((n) => n.languageCode === 'hi')?.name || '');
        setPunjabi(herb.names?.find((n) => n.languageCode === 'pa')?.name || '');
        setBotanicalName(herb.botanicalName || '');
        setCommonName(herb.commonName || '');
        setDescription(herb.description || '');
        setBenefits(herb.benefits || '');
        setUses(herb.uses || '');
        setPartsUsed(herb.partsUsed || '');
        setPreparation(herb.preparation || '');
        setDosage(herb.dosage || '');
        setContraindications(herb.contraindications || '');
        setSelectedIds(
          herb.diseaseCategories?.map((d) => d.diseaseCategory.id) || [],
        );
      })
      .catch(() => setError('Herb not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleCategory = (categoryId: string) => {
    setSelectedIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((x) => x !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    setAddingCategory(true);
    setError('');
    try {
      const created = await createDiseaseCategory({ name });
      setCategories((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setSelectedIds((prev) => [...prev, created.id]);
      setNewCategory('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not add category');
    } finally {
      setAddingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const names = [
      english.trim() ? { languageCode: 'en', name: english.trim() } : null,
      hindi.trim() ? { languageCode: 'hi', name: hindi.trim() } : null,
      punjabi.trim() ? { languageCode: 'pa', name: punjabi.trim() } : null,
    ].filter(Boolean);

    if (names.length === 0 && !commonName.trim() && !botanicalName.trim()) {
      setError('Enter at least one name');
      return;
    }

    const payload = {
      botanicalName: botanicalName.trim() || undefined,
      commonName: commonName.trim() || english.trim() || undefined,
      description: description.trim() || undefined,
      benefits: benefits.trim() || undefined,
      uses: uses.trim() || undefined,
      partsUsed: partsUsed.trim() || undefined,
      preparation: preparation.trim() || undefined,
      dosage: dosage.trim() || undefined,
      contraindications: contraindications.trim() || undefined,
      names,
      diseaseCategoryIds: selectedIds,
    };

    setSaving(true);
    try {
      if (isEdit && id) {
        await updateHerb(id, payload as any);
        navigate(`/herbs/${id}`);
      } else {
        const created = await createHerb(payload as any);
        navigate(`/herbs/${created.id}`);
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
        <button
          type="button"
          onClick={() => navigate('/herbs')}
          className="text-sm text-sarbloh-green hover:underline"
        >
          ← Back to Herbs
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">
          {isEdit ? 'Edit Herb' : 'Add Herb'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Multilingual herb entry</p>
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
          <Field label="Name (English)" value={english} onChange={setEnglish} />
          <Field label="Name (Hindi)" value={hindi} onChange={setHindi} />
          <Field label="Name (Punjabi)" value={punjabi} onChange={setPunjabi} />
          <Field
            label="Botanical Name"
            value={botanicalName}
            onChange={setBotanicalName}
            placeholder="e.g. Withania somnifera"
          />
        </div>

        <Field label="Common Name" value={commonName} onChange={setCommonName} />
        <Area label="Description" value={description} onChange={setDescription} />
        <Area label="Benefits" value={benefits} onChange={setBenefits} />
        <Area label="Uses" value={uses} onChange={setUses} />
        <Area label="Parts Used" value={partsUsed} onChange={setPartsUsed} />
        <Area label="Preparation" value={preparation} onChange={setPreparation} />
        <Area label="Dosage" value={dosage} onChange={setDosage} />
        <Area
          label="Contraindications"
          value={contraindications}
          onChange={setContraindications}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Disease categories
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Select every disease this herb is used for. One herb can have more than one category.
          </p>

          {categories.length === 0 ? (
            <p className="text-sm text-gray-400 mb-3">No categories yet. Add one below.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category, e.g. Digestion"
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={addingCategory || !newCategory.trim()}
              className="px-4 py-2.5 border border-sarbloh-green text-sarbloh-green text-sm font-medium rounded-lg disabled:opacity-50"
            >
              {addingCategory ? 'Adding...' : 'Add category'}
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-sarbloh-red text-white text-sm font-medium rounded-lg disabled:opacity-60"
          >
            {saving ? 'Saving...' : isEdit ? 'Update Herb' : 'Save Herb'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/herbs')}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
      />
    </div>
  );
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
      />
    </div>
  );
}