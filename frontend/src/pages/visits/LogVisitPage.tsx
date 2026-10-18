import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createVisit } from '../../services/visits';
import { getPatient, Patient } from '../../services/patients';

export default function LogVisitPage() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId') || '';
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    visitDate: new Date().toISOString().slice(0, 10),
    complaint: '',
    history: '',
    treatmentAdvice: '',
    followUpDate: '',
    notes: '',
  });

  useEffect(() => {
    if (!patientId) {
      setError('No patient selected');
      setLoading(false);
      return;
    }

    getPatient(patientId)
      .then(setPatient)
      .catch(() => setError('Patient not found'))
      .finally(() => setLoading(false));
  }, [patientId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;

    setError('');
    setSaving(true);

    try {
      const visit = await createVisit({
        patientId,
        visitDate: form.visitDate || undefined,
        complaint: form.complaint.trim() || undefined,
        history: form.history.trim() || undefined,
        treatmentAdvice: form.treatmentAdvice.trim() || undefined,
        followUpDate: form.followUpDate || undefined,
        notes: form.notes.trim() || undefined,
      });
      navigate(`/patients/${patientId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save visit');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  if (error && !patient) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/patients')}
          className="text-sarbloh-green hover:underline"
        >
          Back to Patients
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/patients/${patientId}`)}
          className="text-sm text-sarbloh-green hover:underline"
        >
          ← Back to Patient
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">Log Visit</h1>
        {patient && (
          <p className="text-sm text-gray-500 mt-1">
            {patient.fullName} ({patient.patientCode})
          </p>
        )}
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Visit Date
          </label>
          <input
            type="date"
            name="visitDate"
            value={form.visitDate}
            onChange={handleChange}
            className="w-full max-w-xs px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Problem / Complaint
          </label>
          <textarea
            name="complaint"
            value={form.complaint}
            onChange={handleChange}
            rows={2}
            placeholder="e.g. Arthritis, Pain in knee, ankles, hand"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description / History
          </label>
          <textarea
            name="history"
            value={form.history}
            onChange={handleChange}
            rows={3}
            placeholder="Patient history and description"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Medicine / Treatment / Advice
          </label>
          <textarea
            name="treatmentAdvice"
            value={form.treatmentAdvice}
            onChange={handleChange}
            rows={3}
            placeholder="e.g. ArthraCare 6 month, Constipation 300g, Pain killer Guggul 400 Tab"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Follow-up Date
          </label>
          <input
            type="date"
            name="followUpDate"
            value={form.followUpDate}
            onChange={handleChange}
            className="w-full max-w-xs px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Notes
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-sarbloh-red text-white text-sm font-medium rounded-lg hover:bg-sarbloh-red-dark transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Visit'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/patients/${patientId}`)}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}