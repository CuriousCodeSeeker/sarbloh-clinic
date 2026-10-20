import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getHerb, Herb } from '../../services/herbs';

export default function HerbDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [herb, setHerb] = useState<Herb | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getHerb(id)
      .then(setHerb)
      .catch(() => setError('Herb not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  if (error || !herb) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Herb not found'}</p>
        <Link to="/herbs" className="text-sarbloh-green hover:underline">
          Back to Herbs
        </Link>
      </div>
    );
  }

  const getName = (code: string) =>
    herb.names?.find((n) => n.languageCode === code)?.name || '—';

  const Field = ({
    label,
    value,
  }: {
    label: string;
    value?: string | null;
  }) => (
    <div>
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="font-medium text-gray-900 mt-0.5 whitespace-pre-wrap">
        {value || '—'}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            to="/herbs"
            className="text-sm text-sarbloh-green hover:underline"
          >
            ← Back to Herbs
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">
            {getName('en') !== '—'
              ? getName('en')
              : herb.commonName || herb.botanicalName || 'Herb'}
          </h1>
          {herb.botanicalName && (
            <p className="text-sm text-gray-500 italic mt-1">
              {herb.botanicalName}
            </p>
          )}
        </div>
        <button
          onClick={() => navigate(`/herbs/${herb.id}/edit`)}
          className="px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Edit
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="English" value={getName('en')} />
          <Field label="Hindi" value={getName('hi')} />
          <Field label="Punjabi" value={getName('pa')} />
        </div>
        <Field label="Botanical Name" value={herb.botanicalName} />
        <Field label="Common Name" value={herb.commonName} />
        <Field label="Description" value={herb.description} />
        <Field label="Benefits" value={herb.benefits} />
        <Field label="Uses" value={herb.uses} />
        <Field label="Parts Used" value={herb.partsUsed} />
        <Field label="Preparation" value={herb.preparation} />
        <Field label="Dosage" value={herb.dosage} />
        <Field label="Contraindications" value={herb.contraindications} />
      </div>
    </div>
  );
}
