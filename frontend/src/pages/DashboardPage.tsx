import React from 'react';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Registered Patients</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">0</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Visits Today</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">0</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Visits This Month</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">0</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Collected This Month</div>
          <div className="text-2xl font-bold text-sarbloh-green mt-1">₹0</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Medicines to Reorder</div>
          <div className="text-2xl font-bold text-sarbloh-red mt-1">0</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Follow-ups in 7 Days</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">0</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Today's Appointments</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">0</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Outstanding</div>
          <div className="text-2xl font-bold text-sarbloh-red mt-1">₹0</div>
        </div>
      </div>

      {/* Quick actions */}
      <h2 className="text-lg font-medium text-gray-700 mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button className="py-3 px-4 bg-sarbloh-red text-white rounded font-medium hover:bg-sarbloh-red-dark transition-colors">
          Register Patient
        </button>
        <button className="py-3 px-4 bg-sarbloh-green text-white rounded font-medium hover:bg-sarbloh-green-dark transition-colors">
          Log Visit / Revisit
        </button>
        <button className="py-3 px-4 bg-sarbloh-green text-white rounded font-medium hover:bg-sarbloh-green-dark transition-colors">
          Search Patient
        </button>
        <button className="py-3 px-4 bg-sarbloh-green text-white rounded font-medium hover:bg-sarbloh-green-dark transition-colors">
          Add / Update Medicine
        </button>
        <button className="py-3 px-4 bg-sarbloh-green text-white rounded font-medium hover:bg-sarbloh-green-dark transition-colors">
          Book Appointment
        </button>
        <button className="py-3 px-4 bg-sarbloh-green text-white rounded font-medium hover:bg-sarbloh-green-dark transition-colors">
          Print Prescription
        </button>
        <button className="py-3 px-4 bg-sarbloh-green text-white rounded font-medium hover:bg-sarbloh-green-dark transition-colors">
          View Reports
        </button>
        <button className="py-3 px-4 bg-gray-700 text-white rounded font-medium hover:bg-gray-800 transition-colors">
          Refresh Dashboard
        </button>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Phase 1 complete. Dashboard statistics and actions will become live in later phases.
      </p>
    </div>
  );
}
