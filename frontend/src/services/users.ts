import api from './api';

export interface StaffUser {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'PRACTITIONER';
  phone?: string;
  isActive: boolean;
  createdAt?: string;
}

export async function getUsers() {
  const res = await api.get('/users');
  return res.data.data as StaffUser[];
}

export async function createUser(data: {
  email: string;
  fullName: string;
  password: string;
  role: 'ADMIN' | 'PRACTITIONER';
  phone?: string;
}) {
  const res = await api.post('/users', data);
  return res.data.data as StaffUser;
}

export async function updateUser(
  id: string,
  data: Partial<{
    email: string;
    fullName: string;
    password: string;
    role: 'ADMIN' | 'PRACTITIONER';
    phone: string;
    isActive: boolean;
  }>,
) {
  const res = await api.patch(`/users/${id}`, data);
  return res.data.data as StaffUser;
}

export async function deactivateUser(id: string) {
  const res = await api.delete(`/users/${id}`);
  return res.data.data;
}
