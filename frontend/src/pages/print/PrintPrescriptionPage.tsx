import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPrescription, Prescription } from '../../services/prescriptions';
import { getSettings, ClinicSettings } from '../../services/settings';

export default function PrintPrescriptionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rx, setRx] = useState<Prescription | null>(null);
  const [clinic, setClinic] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([getPrescription(id), getSettings()])
      .then(([prescription, settings]) => {
        setRx(prescription);
        setClinic(settings);
      })
      .catch(() => setError('Failed to load prescription'))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  }

  if (error || !rx) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error || 'Not found'}</p>
        <button onClick={() => navigate(-1)} className="text-sarbloh-green">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Screen-only controls */}
      <div className="print:hidden max-w-3xl mx-auto px-4 py-4 flex gap-3">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-sarbloh-red text-white text-sm font-medium rounded-lg"
        >
          Print
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 text-sm rounded-lg bg-white"
        >
          Back
        </button>
      </div>

      {/* Printable area */}
      <div className="max-w-3xl mx-auto bg-white shadow-sm print:shadow-none p-8 print:p-6 text-gray-900">
        <div className="text-center border-b border-gray-300 pb-4 mb-6">
  <img
    src="/sarbloh-logo.jpg"
    alt="Sarbloh"
    className="h-14 w-auto object-contain mx-auto"
  />
  {clinic?.clinic_address || clinic?.clinic_phone || clinic?.clinic_email ? (
    <p className="text-xs text-gray-500 mt-3">
      {[clinic?.clinic_address, clinic?.clinic_phone, clinic?.clinic_email]
        .filter(Boolean)
        .join(' · ')}
    </p>
  ) : null}
</div>

        <div className="flex justify-between text-sm mb-6">
          <div>
            <div className="font-semibold text-lg">
              {rx.patient?.fullName || 'Patient'}
            </div>
            {rx.patient?.patientCode && (
              <div className="text-gray-600">{rx.patient.patientCode}</div>
            )}
          </div>
          <div className="text-right text-gray-600">
            <div>Date: {formatDate(rx.prescriptionDate)}</div>
            {rx.followUpDate && (
              <div>Follow-up: {formatDate(rx.followUpDate)}</div>
            )}
          </div>
        </div>

        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
          Prescription
        </h2>

        <table className="w-full text-sm border-collapse mb-6">
          <thead>
            <tr className="border-b-2 border-gray-300 text-left">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Medicine</th>
              <th className="py-2 pr-2">Dosage</th>
              <th className="py-2 pr-2">Frequency</th>
              <th className="py-2 pr-2">Duration</th>
              <th className="py-2">Instructions</th>
            </tr>
          </thead>
          <tbody>
            {rx.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-2 pr-2">{i + 1}</td>
                <td className="py-2 pr-2 font-medium">
                  {item.medicineName || '—'}
                </td>
                <td className="py-2 pr-2">{item.dosage || '—'}</td>
                <td className="py-2 pr-2">{item.frequency || '—'}</td>
                <td className="py-2 pr-2">{item.duration || '—'}</td>
                <td className="py-2">
                  {[item.beforeAfterFood, item.instructions]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rx.notes && (
          <div className="text-sm mb-8">
            <span className="font-medium">Notes: </span>
            {rx.notes}
          </div>
        )}

        <div className="mt-16 flex justify-end">
          <div className="text-center text-sm">
            <div className="border-t border-gray-400 w-40 mb-1" />
            <div className="text-gray-600">
              {rx.practitioner?.fullName || 'Practitioner'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
