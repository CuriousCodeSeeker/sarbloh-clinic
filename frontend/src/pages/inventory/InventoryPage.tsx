import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStockLevels, StockItem } from '../../services/inventory';

export default function InventoryPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const loadStock = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const result = await getStockLevels({
        page,
        limit: 20,
        search: searchTerm !== undefined ? searchTerm : search || undefined,
      });
      setItems(result.data || []);
      setTotalPages(result.meta?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadStock(search);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Stock levels and adjustments</p>
        </div>
        <button
          onClick={() => navigate('/inventory/adjust')}
          className="px-4 py-2.5 bg-sarbloh-red text-white text-sm font-medium rounded-lg hover:bg-sarbloh-red-dark transition-colors"
        >
          Adjust Stock
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicine by name, brand or SKU..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-sarbloh-green text-white text-sm font-medium rounded-lg hover:bg-sarbloh-green-dark transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Medicine</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Brand</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Unit</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Current Stock</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Reorder Level</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No medicines found. Add medicines first, then adjust stock.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.brand || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{item.unit || '—'}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {item.currentStock}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {item.reorderLevel ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {item.needsReorder ? (
                      <span className="text-xs font-medium text-sarbloh-red bg-red-50 px-2 py-1 rounded">
                        Low stock
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-sarbloh-green bg-green-50 px-2 py-1 rounded">
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
