import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getHerb, Herb } from '../../services/herbs';
import {
  getHerbFiles,
  uploadHerbFile,
  deleteFile,
  openFileWithAuth,
  AppFile,
} from '../../services/files';

export default function HerbDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [herb, setHerb] = useState<Herb | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [files, setFiles] = useState<AppFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    Promise.all([
      getHerb(id),
      getHerbFiles(id).catch(() => [] as AppFile[]),
    ])
      .then(([herbData, filesData]) => {
        setHerb(herbData);
        setFiles(filesData || []);
      })
      .catch(() => setError('Herb not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setUploading(true);
    setFileError('');
    try {
      await uploadHerbFile(id, file);
      const list = await getHerbFiles(id);
      setFiles(list);
    } catch (err: any) {
      setFileError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Delete this file?')) return;
    try {
      await deleteFile(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch {
      setFileError('Failed to delete file');
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getName = (lang: string) =>
    herb?.names?.find((n) => n.languageCode === lang)?.name || '—';

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

  const displayName =
    herb.commonName ||
    getName('en') ||
    herb.botanicalName ||
    'Herb';

  const categories =
    herb.diseaseCategories?.map((d) => d.diseaseCategory.name) || [];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link to="/herbs" className="text-sm text-sarbloh-green hover:underline">
            ← Back to Herbs
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">
            {displayName}
          </h1>
          {herb.botanicalName && (
            <p className="text-sm text-gray-500 mt-1 italic">{herb.botanicalName}</p>
          )}
        </div>
        <button
          onClick={() => navigate(`/herbs/${herb.id}/edit`)}
          className="px-4 py-2.5 bg-sarbloh-green text-white text-sm font-medium rounded-lg"
        >
          Edit
        </button>
      </div>

      {/* Names */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Names</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-500">English</div>
            <div className="font-medium text-gray-900 mt-0.5">{getName('en')}</div>
          </div>
          <div>
            <div className="text-gray-500">Hindi</div>
            <div className="font-medium text-gray-900 mt-0.5">{getName('hi')}</div>
          </div>
          <div>
            <div className="text-gray-500">Punjabi</div>
            <div className="font-medium text-gray-900 mt-0.5">{getName('pa')}</div>
          </div>
        </div>
      </div>

      {/* Disease categories */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Used for</h2>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-400">No disease categories linked</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((name) => (
              <span
                key={name}
                className="text-xs bg-green-50 text-sarbloh-green px-2.5 py-1 rounded-full font-medium"
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6 space-y-4 text-sm">
        <h2 className="text-lg font-medium text-gray-800">Details</h2>

        {[
          { label: 'Description', value: herb.description },
          { label: 'Benefits', value: herb.benefits },
          { label: 'Uses', value: herb.uses },
          { label: 'Parts used', value: herb.partsUsed },
          { label: 'Preparation', value: herb.preparation },
          { label: 'Dosage', value: herb.dosage },
          { label: 'Contraindications', value: herb.contraindications },
        ].map((row) =>
          row.value ? (
            <div key={row.label}>
              <div className="text-gray-500">{row.label}</div>
              <div className="text-gray-900 mt-0.5 whitespace-pre-wrap">
                {row.value}
              </div>
            </div>
          ) : null,
        )}
      </div>

      {/* Images & documents */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-800">Images & Documents</h2>
          <label className="px-4 py-2 bg-sarbloh-green text-white text-sm font-medium rounded-lg cursor-pointer">
            {uploading ? 'Uploading...' : '+ Upload'}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="hidden"
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
        </div>

        {fileError && (
          <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded">
            {fileError}
          </div>
        )}

        {files.length === 0 ? (
          <p className="text-sm text-gray-400">No files uploaded yet</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {files.map((f) => (
              <li
                key={f.id}
                className="py-3 flex items-center justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {f.originalName || f.fileName}
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    {formatSize(f.fileSize || f.size)} ·{' '}
                    {new Date(f.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => openFileWithAuth(f.id)}
                    className="text-sarbloh-green hover:underline font-medium"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(f.id)}
                    className="text-red-600 hover:underline font-medium"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}