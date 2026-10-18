import api from './api';

export interface Visit {
  id: string;
  patientId: string;
  visitDate: string;
  complaint?: string;
  history?: string;
  treatmentAdvice?: string;
  followUpDate?: string;
  notes?: string;
  patient?: {
    id: string;
    patientCode: string;
    fullName: string;
  };
  practitioner?: {
    id: string;
    fullName: string;
  };
  createdAt?: string;
}

export interface CreateVisitData {
  patientId: string;
  visitDate?: string;
  complaint?: string;
  history?: string;
  treatmentAdvice?: string;
  followUpDate?: string;
  notes?: string;
}

export async function createVisit(data: CreateVisitData) {
  const response = await api.post('/visits', data);
  return response.data.data as Visit;
}

export async function getVisitsByPatient(patientId: string) {
  const response = await api.get(`/visits/patient/${patientId}`);
  return response.data.data as Visit[];
}

export async function getVisit(id: string) {
  const response = await api.get(`/visits/${id}`);
  return response.data.data as Visit;
}

export async function updateVisit(id: string, data: Partial<CreateVisitData>) {
  const response = await api.patch(`/visits/${id}`, data);
  return response.data.data as Visit;
}

export async function getVisits(params?: { page?: number; limit?: number; patientId?: string }) {
  const response = await api.get('/visits', { params });
  return response.data;
}