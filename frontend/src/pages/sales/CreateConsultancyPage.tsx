import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createConsultancy } from '../../services/sales';
import { getPatients, Patient } from '../../services/patients';

export default function CreateConsultancyPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [fee, setFee] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('Consultancy fee');

  useEffect(() => {
    if (!patientSearch.trim() || selectedPatient) {
      setPatientResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await getPatients({ search: patientSearch.trim(), limit: 10 });
        setPatientResults(res.data || []);
      } catch {
        setPatientResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [patientSearch, selectedPatient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const feeNum = parseFloat(fee);
    if (isNaN(feeNum) || feeNum < 0) {
      setError('Enter a valid consultancy fee');
      return;
    }

    const paid = paidAmount === '' ? 0 : parseFloat(paidAmount);
    if (isNaN(paid) || paid < 0) {
      setError('Enter a valid paid amount');
      return;
    }
    if (paid > feeNum) {
      setError('Paid amount cannot be more than fee');
      return;
    }

    setSaving(true);
    try {
      const sale = await createConsultancy({
        patientId: selectedPatient?.id,
        fee: feeNum,
        paidAmount: paid,
        paymentMethod: paid > 0 ? paymentMethod : undefined,
        notes: notes.trim() || 'Consultancy fee',
      });
      navigate(`/sales/${sale.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/sales')}
          className="text-sm text-sarbloh-green hover:underline"
        >
          ← Back to Sales
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">
          Consultancy Invoice
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Separate invoice for consultation fee (not medicine sale)
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
        {/* Patient search (optional – walk-in allowed) */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Patient (optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                setSelectedPatient(null);
              }}
              placeholder="Search patient name or code..."
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
              autoComplete="off"
            />
            {selectedPatient && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPatient(null);
                  setPatientSearch('');
                }}
                className="px-3 py-2.5 border border-gray-300 text-sm rounded-lg"
              >
                Clear
              </button>
            )}
          </div>
          {selectedPatient && (
            <p className="mt-2 text-sm text-sarbloh-green font-medium">
              {selectedPatient.fullName} ({selectedPatient.patientCode})
            </p>
          )}
          {!selectedPatient && patientSearch.trim() && (
            <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {patientResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400">No patients found</div>
              ) : (
                patientResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPatient(p);
                      setPatientSearch(p.fullName);
                      setPatientResults([]);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0"
                  >
                    <span className="font-medium">{p.fullName}</span>
                    <span className="text-gray-500"> · {p.patientCode}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Consultancy fee (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Amount paid now (₹)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            placeholder="0 for pending"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Payment method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
          >
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-sarbloh-red text-white text-sm font-medium rounded-lg disabled:opacity-60"
          >
            {saving ? 'Creating...' : 'Create Invoice'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/sales')}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
