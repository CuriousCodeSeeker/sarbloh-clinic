import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adjustStock } from '../../services/inventory';
import { getMedicines, Medicine } from '../../services/medicines';
import { getHerbs, Herb } from '../../services/herbs';

type ItemType = 'MEDICINE' | 'HERB';

export default function AdjustStockPage() {
  const navigate = useNavigate();
  const [itemType, setItemType] = useState<ItemType>('MEDICINE');
  const [search, setSearch] = useState('');
  const [medResults, setMedResults] = useState<Medicine[]>([]);
  const [herbResults, setHerbResults] = useState<Herb[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [selectedHerb, setSelectedHerb] = useState<Herb | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    transactionType: 'PURCHASE',
    quantity: '',
    notes: '',
  });

  const selected =
    itemType === 'MEDICINE'
      ? selectedMed
        ? selectedMed.name
        : null
      : selectedHerb
        ? selectedHerb.commonName ||
          selectedHerb.names?.find((n) => n.languageCode === 'en')?.name ||
          selectedHerb.botanicalName ||
          'Herb'
        : null;

  useEffect(() => {
    if (!search.trim() || selectedMed || selectedHerb) {
      setMedResults([]);
      setHerbResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        if (itemType === 'MEDICINE') {
          const result = await getMedicines({ search: search.trim(), limit: 15 });
          setMedResults(result.data || []);
          setHerbResults([]);
        } else {
          const result = await getHerbs({ search: search.trim(), limit: 15 });
          setHerbResults(result.data || []);
          setMedResults([]);
        }
      } catch {
        setMedResults([]);
        setHerbResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, itemType, selectedMed, selectedHerb]);

  const clearSelection = () => {
    setSelectedMed(null);
    setSelectedHerb(null);
    setSearch('');
    setMedResults([]);
    setHerbResults([]);
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (itemType === 'MEDICINE' && !selectedMed) {
      setError('Search and select a medicine');
      return;
    }
    if (itemType === 'HERB' && !selectedHerb) {
      setError('Search and select a herb');
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
        medicineId: itemType === 'MEDICINE' ? selectedMed!.id : undefined,
        herbId: itemType === 'HERB' ? selectedHerb!.id : undefined,
        transactionType: form.transactionType,
        quantity: qty,
        notes: form.notes.trim() || undefined,
      });
      setSuccess(`Stock updated for ${selected}`);
      setForm((prev) => ({ ...prev, quantity: '', notes: '' }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/inventory')}
          className="text-sm text-sarbloh-green hover:underline"
        >
          ← Back to Inventory
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">Adjust Stock</h1>
        <p className="text-sm text-gray-500 mt-1">
          Search medicine or herb, then add or reduce stock
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
            Type
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setItemType('MEDICINE');
                clearSelection();
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg ${
                itemType === 'MEDICINE'
                  ? 'bg-sarbloh-green text-white'
                  : 'border border-gray-300 text-gray-700'
              }`}
            >
              Medicine
            </button>
            <button
              type="button"
              onClick={() => {
                setItemType('HERB');
                clearSelection();
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg ${
                itemType === 'HERB'
                  ? 'bg-sarbloh-green text-white'
                  : 'border border-gray-300 text-gray-700'
              }`}
            >
              Herb
            </button>
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {itemType === 'MEDICINE' ? 'Medicine' : 'Herb'}{' '}
            <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedMed(null);
                setSelectedHerb(null);
                setSuccess('');
              }}
              placeholder={
                itemType === 'MEDICINE'
                  ? 'Type medicine name...'
                  : 'Type herb name...'
              }
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
              autoComplete="off"
            />
            {(selectedMed || selectedHerb) && (
              <button
                type="button"
                onClick={clearSelection}
                className="px-3 py-2.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>

          {selected && (
            <p className="mt-2 text-sm text-sarbloh-green font-medium">
              Selected: {selected}
            </p>
          )}

          {!selectedMed && !selectedHerb && search.trim() && (
            <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searching ? (
                <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>
              ) : itemType === 'MEDICINE' ? (
                medResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400">No medicines found</div>
                ) : (
                  medResults.map((med) => (
                    <button
                      key={med.id}
                      type="button"
                      onClick={() => {
                        setSelectedMed(med);
                        setSearch(med.name);
                        setMedResults([]);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0"
                    >
                      <span className="font-medium text-gray-900">{med.name}</span>
                      {med.brand && (
                        <span className="text-gray-500"> · {med.brand}</span>
                      )}
                    </button>
                  ))
                )
              ) : herbResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400">No herbs found</div>
              ) : (
                herbResults.map((herb) => {
                  const name =
                    herb.commonName ||
                    herb.names?.find((n) => n.languageCode === 'en')?.name ||
                    herb.botanicalName ||
                    'Herb';
                  return (
                    <button
                      key={herb.id}
                      type="button"
                      onClick={() => {
                        setSelectedHerb(herb);
                        setSearch(name);
                        setHerbResults([]);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0"
                    >
                      <span className="font-medium text-gray-900">{name}</span>
                      {herb.botanicalName && (
                        <span className="text-gray-500"> · {herb.botanicalName}</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Transaction Type <span className="text-red-500">*</span>
          </label>
          <select
            name="transactionType"
            value={form.transactionType}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, transactionType: e.target.value }))
            }
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
            type="number"
            min="0.01"
            step="0.01"
            value={form.quantity}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, quantity: e.target.value }))
            }
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, notes: e.target.value }))
            }
            rows={2}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || (!selectedMed && !selectedHerb)}
            className="px-5 py-2.5 bg-sarbloh-red text-white text-sm font-medium rounded-lg disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Update Stock'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}