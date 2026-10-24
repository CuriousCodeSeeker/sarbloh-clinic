import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getStockLevels,
  getHerbStockLevels,
  StockItem,
} from '../../services/inventory';

type Tab = 'MEDICINE' | 'HERB';

export default function InventoryPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('MEDICINE');
  const [items, setItems] = useState<StockItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (activeTab: Tab, q?: string) => {
    setLoading(true);
    setError('');
    try {
      const data =
        activeTab === 'MEDICINE'
          ? await getStockLevels(q)
          : await getHerbStockLevels(q);
      setItems(data || []);
    } catch {
      setError('Failed to load inventory');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(tab);
  }, [tab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(tab, search.trim() || undefined);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">
            Stock levels for medicines and herbs
          </p>
        </div>
        <button
          onClick={() => navigate('/inventory/adjust')}
          className="px-4 py-2.5 bg-sarbloh-red text-white text-sm font-medium rounded-lg hover:bg-sarbloh-red-dark"
        >
          Adjust Stock
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => {
            setSearch('');
            setTab('MEDICINE');
          }}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${
            tab === 'MEDICINE'
              ? 'bg-sarbloh-green text-white'
              : 'bg-white border border-gray-200 text-gray-700'
          }`}
        >
          Medicines
        </button>
        <button
          type="button"
          onClick={() => {
            setSearch('');
            setTab('HERB');
          }}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${
            tab === 'HERB'
              ? 'bg-sarbloh-green text-white'
              : 'bg-white border border-gray-200 text-gray-700'
          }`}
        >
          Herbs
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            tab === 'MEDICINE'
              ? 'Search medicine name, brand, SKU...'
              : 'Search herb name...'
          }
          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-sarbloh-green text-white text-sm font-medium rounded-lg"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              {tab === 'MEDICINE' && (
                <>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Brand</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Unit</th>
                </>
              )}
              <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
              {tab === 'MEDICINE' && (
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Reorder Level
                </th>
              )}
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={tab === 'MEDICINE' ? 6 : 3}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={tab === 'MEDICINE' ? 6 : 3}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No items found
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  {tab === 'MEDICINE' && (
                    <>
                      <td className="px-4 py-3 text-gray-600">{item.brand || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{item.unit || '—'}</td>
                    </>
                  )}
                  <td className="px-4 py-3 text-right font-medium">
                    {item.currentStock}
                  </td>
                  {tab === 'MEDICINE' && (
                    <td className="px-4 py-3 text-right text-gray-600">
                      {item.reorderLevel ?? '—'}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    {item.needsReorder ? (
                      <span className="text-xs text-sarbloh-red bg-red-50 px-2 py-1 rounded">
                        Low stock
                      </span>
                    ) : (
                      <span className="text-xs text-sarbloh-green bg-green-50 px-2 py-1 rounded">
                        OK
                      </span>
                    )}
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