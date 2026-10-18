import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getPatient, Patient } from '../../services/patients';
import { getVisitsByPatient, Visit } from '../../services/visits';
import {
  getPrescriptionsByPatient,
  Prescription,
} from '../../services/prescriptions';

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    Promise.all([
      getPatient(id),
      getVisitsByPatient(id),
      getPrescriptionsByPatient(id),
    ])
      .then(([patientData, visitsData, prescriptionsData]) => {
        setPatient(patientData);
        setVisits(visitsData || []);
        setPrescriptions(prescriptionsData || []);
      })
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

  const phone = patient.contacts?.find(
    (c) => c.type === 'phone' || c.isPrimary,
  )?.value;
  const address = patient.addresses?.[0];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            to="/patients"
            className="text-sm text-sarbloh-green hover:underline"
          >
            ← Back to Patients
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">
            {patient.fullName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{patient.patientCode}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              navigate(`/prescriptions/new?patientId=${patient.id}`)
            }
            className="px-4 py-2.5 bg-sarbloh-green text-white text-sm font-medium rounded-lg hover:bg-sarbloh-green-dark transition-colors"
          >
            Create Prescription
          </button>
          <button
            onClick={() => navigate(`/visits/new?patientId=${patient.id}`)}
            className="px-4 py-2.5 bg-sarbloh-red text-white text-sm font-medium rounded-lg hover:bg-sarbloh-red-dark transition-colors"
          >
            Log Visit
          </button>
          <button
            onClick={() => navigate(`/patients/${patient.id}/edit`)}
            className="px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          Patient Information
        </h2>
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
            <div className="font-medium text-gray-900 mt-0.5">
              {phone || '—'}
            </div>
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
                ? [
                    address.addressLine,
                    address.city,
                    address.state,
                    address.pincode,
                  ]
                    .filter(Boolean)
                    .join(', ')
                : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-800">Prescriptions</h2>
          <span className="text-sm text-gray-500">
            {prescriptions.length} prescription(s)
          </span>
        </div>

        {prescriptions.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            No prescriptions yet
          </p>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((rx) => (
              <div
                key={rx.id}
                className="border border-gray-100 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="font-medium text-gray-900">
                    {formatDate(rx.prescriptionDate)}
                  </div>
                  {rx.followUpDate && (
                    <div className="text-xs text-sarbloh-green bg-green-50 px-2 py-1 rounded">
                      Follow-up: {formatDate(rx.followUpDate)}
                    </div>
                  )}
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="pb-2 font-medium">Medicine</th>
                      <th className="pb-2 font-medium">Dosage</th>
                      <th className="pb-2 font-medium">Frequency</th>
                      <th className="pb-2 font-medium">Duration</th>
                      <th className="pb-2 font-medium">Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rx.items.map((item, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-2 text-gray-900">
                          {item.medicineName || '—'}
                        </td>
                        <td className="py-2 text-gray-700">
                          {item.dosage || '—'}
                        </td>
                        <td className="py-2 text-gray-700">
                          {item.frequency || '—'}
                        </td>
                        <td className="py-2 text-gray-700">
                          {item.duration || '—'}
                        </td>
                        <td className="py-2 text-gray-700">
                          {[item.beforeAfterFood, item.instructions]
                            .filter(Boolean)
                            .join(' · ') || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rx.practitioner && (
                  <div className="text-xs text-gray-400 mt-2">
                    By {rx.practitioner.fullName}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visit History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-800">Visit History</h2>
          <span className="text-sm text-gray-500">{visits.length} visit(s)</span>
        </div>

        {visits.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            No visits recorded yet
          </p>
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => (
              <div
                key={visit.id}
                className="border border-gray-100 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-gray-900">
                    {formatDate(visit.visitDate)}
                  </div>
                  {visit.followUpDate && (
                    <div className="text-xs text-sarbloh-green bg-green-50 px-2 py-1 rounded">
                      Follow-up: {formatDate(visit.followUpDate)}
                    </div>
                  )}
                </div>
                {visit.complaint && (
                  <div className="text-sm mt-2">
                    <span className="text-gray-500">Complaint: </span>
                    <span className="text-gray-800">{visit.complaint}</span>
                  </div>
                )}
                {visit.history && (
                  <div className="text-sm mt-1">
                    <span className="text-gray-500">History: </span>
                    <span className="text-gray-800">{visit.history}</span>
                  </div>
                )}
                {visit.treatmentAdvice && (
                  <div className="text-sm mt-1">
                    <span className="text-gray-500">Treatment: </span>
                    <span className="text-gray-800">
                      {visit.treatmentAdvice}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}