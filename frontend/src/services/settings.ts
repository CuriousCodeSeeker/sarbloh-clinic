import api from './api';

export interface ClinicSettings {
  clinic_name: string;
  clinic_address: string;
  clinic_phone: string;
  clinic_email: string;
  clinic_tagline: string;
}

export async function getSettings() {
  const response = await api.get('/settings');
  return response.data.data as ClinicSettings;
}

export async function updateSettings(data: Partial<ClinicSettings>) {
  const response = await api.put('/settings', data);
  return response.data.data as ClinicSettings;
}
