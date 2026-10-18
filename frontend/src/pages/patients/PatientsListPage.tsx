import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getPatients, Patient } from '../../services/patients';

export default function PatientsListPage() {
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const loadPatients = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const result = await getPatients({
        page,
        limit: 20,
        search: searchTerm !== undefined ? searchTerm : search || undefined,
      });
      setPatients(result.data || []);
      setTotalPages(result.meta?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    setSearch(urlSearch);
    loadPatients(urlSearch);
  }, [page, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadPatients();
  };

  const getPrimaryPhone = (patient: Patient) => {
    const phone = patient.contacts?.find((c) => c.type === 'phone' || c.isPrimary);
    return phone?.value || '—';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500 mt-1">Manage patient records</p>
        </div>
        <button
          onClick={() => navigate('/patients/new')}
          className="px-4 py-2.5 bg-sarbloh-red text-white text-sm font-medium rounded-lg hover:bg-sarbloh-red-dark transition-colors"
        >
          + Register Patient
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, patient code, phone, or father/husband name..."
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Father / Husband</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Age</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Gender</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
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
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No patients found
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sarbloh-green">
                    {patient.patientCode}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {patient.fullName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {patient.fatherHusbandName || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {patient.ageAtRegistration ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {patient.gender || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {getPrimaryPhone(patient)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/patients/${patient.id}`}
                      className="text-sarbloh-green hover:underline font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
