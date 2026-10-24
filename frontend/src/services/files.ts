import api from './api';

export interface AppFile {
  id: string;
  fileName?: string;
  originalName?: string;
  mimeType?: string;
  fileType?: string;
  fileSize?: number;
  size?: number;
  createdAt: string;
}

export type PatientReport = AppFile;

export async function getPatientReports(patientId: string) {
  const res = await api.get(`/files/patients/${patientId}/reports`);
  return res.data.data as AppFile[];
}

export async function uploadPatientReport(patientId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post(`/files/patients/${patientId}/reports`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function deletePatientReport(id: string) {
  const res = await api.delete(`/files/${id}`);
  return res.data;
}

export async function getHerbFiles(herbId: string) {
  const res = await api.get(`/files/herbs/${herbId}/files`);
  return res.data.data as AppFile[];
}

export async function uploadHerbFile(herbId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post(`/files/herbs/${herbId}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function deleteFile(id: string) {
  const res = await api.delete(`/files/${id}`);
  return res.data;
}

export function getReportDownloadUrl(id: string) {
  const base = api.defaults.baseURL || 'http://localhost:3000/api/v1';
  return `${base}/files/${id}/download`;
}

export function getFileDownloadUrl(id: string) {
  return getReportDownloadUrl(id);
}

export function openFileWithAuth(id: string) {
  const token = localStorage.getItem('token');
  return fetch(getFileDownloadUrl(id), {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
}