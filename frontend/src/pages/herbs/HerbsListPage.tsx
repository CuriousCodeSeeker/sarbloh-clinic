import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHerbs, Herb } from '../../services/herbs';

export default function HerbsListPage() {
  const [herbs, setHerbs] = useState<Herb[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const loadHerbs = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const result = await getHerbs({
        page,
        limit: 20,
        search: searchTerm !== undefined ? searchTerm : search || undefined,
      });
      setHerbs(result.data || []);
      setTotalPages(result.meta?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHerbs();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadHerbs(search);
  };

  const getName = (herb: Herb, code: string) =>
    herb.names?.find((n) => n.languageCode === code)?.name || '—';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Herbs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ayurvedic herb catalog (multilingual)
          </p>
        </div>
        <button
          onClick={() => navigate('/herbs/new')}
          className="px-4 py-2.5 bg-sarbloh-red text-white text-sm font-medium rounded-lg hover:bg-sarbloh-red-dark transition-colors"
        >
          + Add Herb
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name (any language) or botanical name..."
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
              <th className="text-left px-4 py-3 font-medium text-gray-600">English</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Hindi</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Punjabi</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Botanical</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : herbs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No herbs found
                </td>
              </tr>
            ) : (
              herbs.map((herb) => (
                <tr
                  key={herb.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {getName(herb, 'en') !== '—'
                      ? getName(herb, 'en')
                      : herb.commonName || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{getName(herb, 'hi')}</td>
                  <td className="px-4 py-3 text-gray-700">{getName(herb, 'pa')}</td>
                  <td className="px-4 py-3 text-gray-600 italic">
                    {herb.botanicalName || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/herbs/${herb.id}`)}
                      className="text-sarbloh-green hover:underline font-medium mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/herbs/${herb.id}/edit`)}
                      className="text-gray-600 hover:underline font-medium"
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
