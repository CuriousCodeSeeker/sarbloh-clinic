import api from './api';

export interface PatientReport {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export async function getPatientReports(patientId: string) {
  const res = await api.get(`/files/patients/${patientId}/reports`);
  return res.data.data as PatientReport[];
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

export function getReportDownloadUrl(id: string) {
  const base = api.defaults.baseURL || 'http://localhost:3000/api/v1';
  return `${base}/files/${id}/download`;
}
