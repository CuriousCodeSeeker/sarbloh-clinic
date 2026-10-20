import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getSettings, updateSettings, ClinicSettings } from '../../services/settings';
import {
  getUsers,
  createUser,
  deactivateUser,
  StaffUser,
} from '../../services/users';

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [form, setForm] = useState<ClinicSettings>({
    clinic_name: '',
    clinic_address: '',
    clinic_phone: '',
    clinic_email: '',
    clinic_tagline: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [users, setUsers] = useState<StaffUser[]>([]);
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'PRACTITIONER' as 'ADMIN' | 'PRACTITIONER',
  });
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  const [userSaving, setUserSaving] = useState(false);

  const loadUsers = () => {
    if (!isAdmin) return;
    getUsers()
      .then(setUsers)
      .catch(() => setUserError('Failed to load users'));
  };

  useEffect(() => {
    getSettings()
      .then((data) => setForm((prev) => ({ ...prev, ...data })))
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false));
    loadUsers();
  }, [isAdmin]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const data = await updateSettings(form);
      setForm(data);
      setSuccess('Settings saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');
    setUserSaving(true);
    try {
      await createUser(userForm);
      setUserForm({
        fullName: '',
        email: '',
        password: '',
        role: 'PRACTITIONER',
      });
      setUserSuccess('User created successfully');
      loadUsers();
    } catch (err: any) {
      setUserError(
        err.response?.data?.message || 'Failed to create user',
      );
    } finally {
      setUserSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deactivate this user? They will not be able to log in.')) {
      return;
    }
    try {
      await deactivateUser(id);
      loadUsers();
    } catch (err: any) {
      setUserError(err.response?.data?.message || 'Failed to deactivate user');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Clinic information and users</p>
      </div>

      {/* Clinic settings */}
      <div>
        <h2 className="text-lg font-medium text-gray-800 mb-3">Clinic Information</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Clinic Name
            </label>
            <input
              name="clinic_name"
              value={form.clinic_name}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tagline
            </label>
            <input
              name="clinic_tagline"
              value={form.clinic_tagline}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Address
            </label>
            <textarea
              name="clinic_address"
              value={form.clinic_address}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone
              </label>
              <input
                name="clinic_phone"
                value={form.clinic_phone}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                name="clinic_email"
                type="email"
                value={form.clinic_email}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-sarbloh-red text-white text-sm font-medium rounded-lg hover:bg-sarbloh-red-dark disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* User management – Admin only */}
      {isAdmin && (
        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-3">
            User Management
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Create staff accounts. Only Admin can manage users.
          </p>

          {userError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {userError}
            </div>
          )}
          {userSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {userSuccess}
            </div>
          )}

          <form
            onSubmit={handleCreateUser}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  required
                  value={userForm.fullName}
                  onChange={(e) =>
                    setUserForm((p) => ({ ...p, fullName: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm((p) => ({ ...p, email: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm((p) => ({ ...p, password: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm((p) => ({
                      ...p,
                      role: e.target.value as 'ADMIN' | 'PRACTITIONER',
                    }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
                >
                  <option value="PRACTITIONER">Practitioner</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={userSaving}
              className="px-5 py-2.5 bg-sarbloh-green text-white text-sm font-medium rounded-lg disabled:opacity-60"
            >
              {userSaving ? 'Creating...' : 'Create User'}
            </button>
          </form>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {u.fullName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{u.role}</td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <span className="text-xs text-sarbloh-green bg-green-50 px-2 py-1 rounded">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive && u.id !== user?.id && (
                        <button
                          onClick={() => handleDeactivate(u.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}