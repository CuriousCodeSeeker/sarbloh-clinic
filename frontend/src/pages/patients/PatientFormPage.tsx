import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPatient, getPatient, updatePatient, CreatePatientData } from '../../services/patients';

export default function PatientFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    fatherHusbandName: '',
    ageAtRegistration: '',
    gender: '',
    maritalStatus: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    referredBy: '',
    notes: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      getPatient(id)
        .then((patient) => {
          const phone = patient.contacts?.find((c) => c.type === 'phone')?.value || '';
          const address = patient.addresses?.[0];
          setForm({
            fullName: patient.fullName || '',
            fatherHusbandName: patient.fatherHusbandName || '',
            ageAtRegistration: patient.ageAtRegistration?.toString() || '',
            gender: patient.gender || '',
            maritalStatus: patient.maritalStatus || '',
            phone,
            addressLine: address?.addressLine || '',
            city: address?.city || '',
            state: address?.state || '',
            pincode: address?.pincode || '',
            referredBy: patient.referredBy || '',
            notes: patient.notes || '',
          });
        })
        .catch(() => setError('Failed to load patient'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload: CreatePatientData = {
        fullName: form.fullName.trim(),
        fatherHusbandName: form.fatherHusbandName.trim() || undefined,
        ageAtRegistration: form.ageAtRegistration ? parseInt(form.ageAtRegistration, 10) : undefined,
        gender: (form.gender as any) || undefined,
        maritalStatus: (form.maritalStatus as any) || undefined,
        referredBy: form.referredBy.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };

      if (form.phone.trim()) {
        payload.contacts = [{ type: 'phone', value: form.phone.trim(), isPrimary: true }];
      }

      if (form.addressLine.trim()) {
        payload.address = {
          addressLine: form.addressLine.trim(),
          city: form.city.trim() || undefined,
          state: form.state.trim() || undefined,
          pincode: form.pincode.trim() || undefined,
          country: 'India',
        };
      }

      if (isEdit && id) {
        await updatePatient(id, payload);
        navigate(`/patients/${id}`);
      } else {
        const patient = await createPatient(payload);
        navigate(`/patients/${patient.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save patient');
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
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEdit ? 'Edit Patient' : 'Register Patient'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit ? 'Update patient information' : 'Add a new patient record'}
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Patient Name <span className="text-red-500">*</span>
            </label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Father / Husband Name
            </label>
            <input
              name="fatherHusbandName"
              value={form.fatherHusbandName}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
            <input
              name="ageAtRegistration"
              type="number"
              min="0"
              max="150"
              value={form.ageAtRegistration}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            >
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Marital Status</label>
            <select
              name="maritalStatus"
              value={form.maritalStatus}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            >
              <option value="">Select</option>
              <option value="SINGLE">Single</option>
              <option value="MARRIED">Married</option>
              <option value="WIDOWED">Widowed</option>
              <option value="DIVORCED">Divorced</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <input
              name="addressLine"
              value={form.addressLine}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode</label>
            <input
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Referred By</label>
            <input
              name="referredBy"
              value={form.referredBy}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-sarbloh-red text-white text-sm font-medium rounded-lg hover:bg-sarbloh-red-dark transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : isEdit ? 'Update Patient' : 'Register Patient'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
