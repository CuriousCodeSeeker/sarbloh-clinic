import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getPatient, Patient } from '../../services/patients';

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getPatient(id)
      .then(setPatient)
      .catch(() => setError('Patient not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  if (error || !patient) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Patient not found'}</p>
        <Link to="/patients" className="text-sarbloh-green hover:underline">
          Back to Patients
        </Link>
      </div>
    );
  }

  const phone = patient.contacts?.find((c) => c.type === 'phone' || c.isPrimary)?.value;
  const address = patient.addresses?.[0];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/patients" className="text-sm text-sarbloh-green hover:underline">
            ← Back to Patients
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">{patient.fullName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {patient.patientCode}
          </p>
        </div>
        <button
          onClick={() => navigate(`/patients/${patient.id}/edit`)}
          className="px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Edit
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Patient Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div>
            <div className="text-gray-500">Father / Husband Name</div>
            <div className="font-medium text-gray-900 mt-0.5">
              {patient.fatherHusbandName || '—'}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Age</div>
            <div className="font-medium text-gray-900 mt-0.5">
              {patient.ageAtRegistration ?? '—'}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Gender</div>
            <div className="font-medium text-gray-900 mt-0.5">
              {patient.gender || '—'}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Marital Status</div>
            <div className="font-medium text-gray-900 mt-0.5">
              {patient.maritalStatus || '—'}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Phone</div>
            <div className="font-medium text-gray-900 mt-0.5">{phone || '—'}</div>
          </div>
          <div>
            <div className="text-gray-500">Referred By</div>
            <div className="font-medium text-gray-900 mt-0.5">
              {patient.referredBy || '—'}
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="text-gray-500">Address</div>
            <div className="font-medium text-gray-900 mt-0.5">
              {address
                ? [address.addressLine, address.city, address.state, address.pincode]
                    .filter(Boolean)
                    .join(', ')
                : '—'}
            </div>
          </div>
          {patient.notes && (
            <div className="md:col-span-2">
              <div className="text-gray-500">Notes</div>
              <div className="font-medium text-gray-900 mt-0.5">{patient.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
