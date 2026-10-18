import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPrescription } from '../../services/prescriptions';
import { getPatient, Patient } from '../../services/patients';

interface ItemForm {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: string;
  instructions: string;
  beforeAfterFood: string;
}

const emptyItem = (): ItemForm => ({
  medicineName: '',
  dosage: '',
  frequency: '',
  duration: '',
  quantity: '',
  instructions: '',
  beforeAfterFood: '',
});

export default function CreatePrescriptionPage() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId') || '';
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [prescriptionDate, setPrescriptionDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ItemForm[]>([emptyItem()]);

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

  const updateItem = (index: number, field: keyof ItemForm, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;

    const validItems = items.filter((item) => item.medicineName.trim());
    if (validItems.length === 0) {
      setError('Add at least one medicine');
      return;
    }

    setError('');
    setSaving(true);

    try {
      await createPrescription({
        patientId,
        prescriptionDate: prescriptionDate || undefined,
        followUpDate: followUpDate || undefined,
        notes: notes.trim() || undefined,
        items: validItems.map((item) => ({
          medicineName: item.medicineName.trim(),
          dosage: item.dosage.trim() || undefined,
          frequency: item.frequency.trim() || undefined,
          duration: item.duration.trim() || undefined,
          quantity: item.quantity ? parseFloat(item.quantity) : undefined,
          instructions: item.instructions.trim() || undefined,
          beforeAfterFood: item.beforeAfterFood || undefined,
        })),
      });
      navigate(`/patients/${patientId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save prescription');
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/patients/${patientId}`)}
          className="text-sm text-sarbloh-green hover:underline"
        >
          ← Back to Patient
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">
          Create Prescription
        </h1>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Prescription Date
              </label>
              <input
                type="date"
                value={prescriptionDate}
                onChange={(e) => setPrescriptionDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Follow-up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
              />
            </div>
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
        </div>

        {/* Medicine items */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Medicines</h2>
            <button
              type="button"
              onClick={addItem}
              className="text-sm text-sarbloh-green hover:underline font-medium"
            >
              + Add Medicine
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="border border-gray-100 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Medicine {index + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Medicine Name *
                  </label>
                  <input
                    value={item.medicineName}
                    onChange={(e) =>
                      updateItem(index, 'medicineName', e.target.value)
                    }
                    placeholder="e.g. Ashwagandha Tablet"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Dosage
                    </label>
                    <input
                      value={item.dosage}
                      onChange={(e) =>
                        updateItem(index, 'dosage', e.target.value)
                      }
                      placeholder="1 tablet"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Frequency
                    </label>
                    <input
                      value={item.frequency}
                      onChange={(e) =>
                        updateItem(index, 'frequency', e.target.value)
                      }
                      placeholder="2 times/day"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Duration
                    </label>
                    <input
                      value={item.duration}
                      onChange={(e) =>
                        updateItem(index, 'duration', e.target.value)
                      }
                      placeholder="30 days"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, 'quantity', e.target.value)
                      }
                      placeholder="60"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Before / After Food
                    </label>
                    <select
                      value={item.beforeAfterFood}
                      onChange={(e) =>
                        updateItem(index, 'beforeAfterFood', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
                    >
                      <option value="">Select</option>
                      <option value="Before food">Before food</option>
                      <option value="After food">After food</option>
                      <option value="With food">With food</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Instructions
                    </label>
                    <input
                      value={item.instructions}
                      onChange={(e) =>
                        updateItem(index, 'instructions', e.target.value)
                      }
                      placeholder="Any special instructions"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-sarbloh-red text-white text-sm font-medium rounded-lg hover:bg-sarbloh-red-dark transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Prescription'}
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
