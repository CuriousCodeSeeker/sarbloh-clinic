import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/patients', label: 'Patients' },
  { path: '/visits', label: 'Visits' },
  { path: '/prescriptions', label: 'Prescriptions' },
  { path: '/medicines', label: 'Medicines' },
  { path: '/inventory', label: 'Inventory' },
  { path: '/herbs', label: 'Herbs' },
  { path: '/sales', label: 'Sales' },
  { path: '/appointments', label: 'Appointments' },
  { path: '/reports', label: 'Reports' },
  { path: '/settings', label: 'Settings' },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-sarbloh-cream">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-sarbloh-red">Sarbloh</h1>
          <p className="text-xs text-sarbloh-green">Ayurvedic Clinic</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sarbloh-green text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-1 truncate">{user?.fullName}</div>
          <div className="text-xs text-gray-400 mb-2">{user?.role}</div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-sarbloh-red hover:bg-red-50 rounded"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search patients, medicines..."
              className="w-full max-w-md px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-sarbloh-green"
            />
          </div>
          <div className="text-sm text-gray-600">
            {user?.fullName}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
