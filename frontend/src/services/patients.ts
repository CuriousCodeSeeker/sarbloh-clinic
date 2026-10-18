import api from './api';

export interface PatientContact {
  id?: string;
  type: string;
  value: string;
  isPrimary?: boolean;
}

export interface PatientAddress {
  id?: string;
  addressLine: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface Patient {
  id: string;
  patientCode: string;
  fullName: string;
  fatherHusbandName?: string;
  dateOfBirth?: string;
  ageAtRegistration?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'WIDOWED' | 'DIVORCED' | 'OTHER';
  referredBy?: string;
  notes?: string;
  contacts?: PatientContact[];
  addresses?: PatientAddress[];
  createdAt: string;
}

export interface CreatePatientData {
  fullName: string;
  fatherHusbandName?: string;
  dateOfBirth?: string;
  ageAtRegistration?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'WIDOWED' | 'DIVORCED' | 'OTHER';
  referredBy?: string;
  notes?: string;
  contacts?: { type: string; value: string; isPrimary?: boolean }[];
  address?: {
    addressLine: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
}

export async function getPatients(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const response = await api.get('/patients', { params });
  return response.data;
}

export async function getPatient(id: string) {
  const response = await api.get(`/patients/${id}`);
  return response.data.data as Patient;
}

export async function createPatient(data: CreatePatientData) {
  const response = await api.post('/patients', data);
  return response.data.data as Patient;
}

export async function updatePatient(id: string, data: Partial<CreatePatientData>) {
  const response = await api.patch(`/patients/${id}`, data);
  return response.data.data as Patient;
}

export async function deletePatient(id: string) {
  const response = await api.delete(`/patients/${id}`);
  return response.data;
}
