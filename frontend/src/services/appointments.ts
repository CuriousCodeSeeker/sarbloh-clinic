import api from './api';

export interface Appointment {
  id: string;
  patientId: string;
  appointmentDate: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  status: string;
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

export interface CreateAppointmentData {
  patientId: string;
  appointmentDate: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  status?: string;
}

export async function getAppointments(params?: {
  page?: number;
  limit?: number;
  date?: string;
  status?: string;
}) {
  const response = await api.get('/appointments', { params });
  return response.data;
}

export async function getAppointment(id: string) {
  const response = await api.get(`/appointments/${id}`);
  return response.data.data as Appointment;
}

export async function createAppointment(data: CreateAppointmentData) {
  const response = await api.post('/appointments', data);
  return response.data.data as Appointment;
}

export async function updateAppointment(
  id: string,
  data: Partial<CreateAppointmentData>,
) {
  const response = await api.patch(`/appointments/${id}`, data);
  return response.data.data as Appointment;
}
