import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMedicines, Medicine } from '../../services/medicines';

export default function MedicinesListPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const loadMedicines = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const result = await getMedicines({
        page,
        limit: 20,
        search: searchTerm !== undefined ? searchTerm : search || undefined,
      });
      setMedicines(result.data || []);
      setTotalPages(result.meta?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadMedicines(search);
  };

  const formatPrice = (value?: number | string | null) => {
    if (value === null || value === undefined) return '—';
    return `₹${Number(value).toLocaleString('en-IN')}`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Medicines</h1>
          <p className="text-sm text-gray-500 mt-1">Medicine catalog</p>
        </div>
        <button
          onClick={() => navigate('/medicines/new')}
          className="px-4 py-2.5 bg-sarbloh-red text-white text-sm font-medium rounded-lg hover:bg-sarbloh-red-dark transition-colors"
        >
          + Add Medicine
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand or SKU..."
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
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Brand</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Unit</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Purchase Price</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Selling Price</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Reorder Level</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : medicines.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No medicines found
                </td>
              </tr>
            ) : (
              medicines.map((med) => (
                <tr key={med.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{med.name}</td>
                  <td className="px-4 py-3 text-gray-600">{med.brand || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{med.unit || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{formatPrice(med.purchasePrice)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatPrice(med.sellingPrice)}</td>
                  <td className="px-4 py-3 text-gray-600">{med.reorderLevel ?? '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/medicines/${med.id}/edit`)}
                      className="text-sarbloh-green hover:underline font-medium"
                    >
                      Edit
                    </button>
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
