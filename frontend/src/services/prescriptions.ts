import api from './api';

export interface PrescriptionItem {
  id?: string;
  medicineId?: string;
  medicineName?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity?: number;
  route?: string;
  instructions?: string;
  beforeAfterFood?: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  visitId?: string;
  prescriptionDate: string;
  notes?: string;
  followUpDate?: string;
  items: PrescriptionItem[];
  patient?: {
    id: string;
    patientCode: string;
    fullName: string;
  };
  practitioner?: {
    id: string;
    fullName: string;
  };
}

export interface CreatePrescriptionData {
  patientId: string;
  visitId?: string;
  prescriptionDate?: string;
  notes?: string;
  followUpDate?: string;
  items: {
    medicineName?: string;
    medicineId?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    quantity?: number;
    route?: string;
    instructions?: string;
    beforeAfterFood?: string;
    notes?: string;
  }[];
}

export async function createPrescription(data: CreatePrescriptionData) {
  const response = await api.post('/prescriptions', data);
  return response.data.data as Prescription;
}

export async function getPrescriptionsByPatient(patientId: string) {
  const response = await api.get(`/prescriptions/patient/${patientId}`);
  return response.data.data as Prescription[];
}

export async function getPrescription(id: string) {
  const response = await api.get(`/prescriptions/${id}`);
  return response.data.data as Prescription;
}