import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface DashboardStats {
  registeredPatients: number;
  visitsToday: number;
  visitsThisMonth: number;
  collectedThisMonth: number;
  medicinesToReorder: number;
  followUpsIn7Days: number;
  todaysAppointments: number;
  outstanding: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatCurrency = (value: number) =>
    `₹${value.toLocaleString('en-IN')}`;

  const statCards = [
    { label: 'Registered Patients', value: stats?.registeredPatients ?? 0, color: 'text-gray-800' },
    { label: 'Visits Today', value: stats?.visitsToday ?? 0, color: 'text-gray-800' },
    { label: 'Visits This Month', value: stats?.visitsThisMonth ?? 0, color: 'text-gray-800' },
    { label: 'Collected This Month', value: formatCurrency(stats?.collectedThisMonth ?? 0), color: 'text-sarbloh-green' },
    { label: 'Medicines to Reorder', value: stats?.medicinesToReorder ?? 0, color: 'text-sarbloh-red' },
    { label: 'Follow-ups in 7 Days', value: stats?.followUpsIn7Days ?? 0, color: 'text-gray-800' },
    { label: "Today's Appointments", value: stats?.todaysAppointments ?? 0, color: 'text-gray-800' },
    { label: 'Outstanding', value: formatCurrency(stats?.outstanding ?? 0), color: 'text-sarbloh-red' },
  ];

  const quickActions = [
    { label: 'Register Patient', color: 'bg-sarbloh-green hover:bg-sarbloh-green-dark', action: () => navigate('/patients/new') },
    { label: 'Search Patient', color: 'bg-sarbloh-green hover:bg-sarbloh-green-dark', action: () => navigate('/patients') },
    { label: 'Add / Update Medicine', color: 'bg-sarbloh-green hover:bg-sarbloh-green-dark', action: () => navigate('/medicines/new') },
    { label: 'Book Appointment', color: 'bg-sarbloh-green hover:bg-sarbloh-green-dark', action: () => navigate('/appointments/new') },
    { label: 'Print Prescription', color: 'bg-sarbloh-green hover:bg-sarbloh-green-dark', action: () => navigate('/patients') },
    { label: 'View Reports', color: 'bg-sarbloh-green hover:bg-sarbloh-green-dark', action: () => navigate('/reports') },
    // { label: 'Refresh Dashboard', color: 'bg-gray-700 hover:bg-gray-800', action: () => { setLoading(true); loadStats(); } },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of clinic and shop operations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
          >
            <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
            <div className={`text-2xl font-bold mt-2 ${stat.color}`}>
              {loading ? '—' : stat.value}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className={`py-3.5 px-4 text-white rounded-xl font-medium text-sm shadow-sm transition-all ${action.color}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}