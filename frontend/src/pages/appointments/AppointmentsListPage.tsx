import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAppointments,
  updateAppointment,
  Appointment,
} from '../../services/appointments';

export default function AppointmentsListPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const result = await getAppointments({
        page,
        limit: 30,
        date: date || undefined,
      });
      setAppointments(result.data || []);
      setTotalPages(result.meta?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [page, date]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const statusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-sarbloh-green bg-green-50';
      case 'CANCELLED':
      case 'NO_SHOW':
        return 'text-sarbloh-red bg-red-50';
      case 'CONFIRMED':
        return 'text-blue-700 bg-blue-50';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateAppointment(id, { status });
      loadAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">Schedule and manage visits</p>
        </div>
        <button
          onClick={() => navigate('/appointments/new')}
          className="px-4 py-2.5 bg-sarbloh-red text-white text-sm font-medium rounded-lg hover:bg-sarbloh-red-dark transition-colors"
        >
          + Book Appointment
        </button>
      </div>

      <div className="mb-6 flex gap-3 items-center">
        <label className="text-sm text-gray-600">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sarbloh-green"
        />
        <button
          type="button"
          onClick={() => {
            setDate(new Date().toISOString().slice(0, 10));
            setPage(1);
          }}
          className="px-3 py-2 text-sm text-sarbloh-green hover:underline"
        >
          Today
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Patient</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Notes</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No appointments for this date
                </td>
              </tr>
            ) : (
              appointments.map((apt) => (
                <tr
                  key={apt.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {apt.startTime || '—'}
                    {apt.endTime ? ` – ${apt.endTime}` : ''}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {apt.patient?.fullName || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {apt.patient?.patientCode || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                    {apt.notes || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${statusColor(
                        apt.status,
                      )}`}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={apt.status}
                      onChange={(e) =>
                        handleStatusChange(apt.id, e.target.value)
                      }
                      className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sarbloh-green"
                    >
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="NO_SHOW">No-show</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
