import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/patients', label: 'Patients', icon: '👤' },
  { path: '/visits', label: 'Visits', icon: '🩺' },
  { path: '/prescriptions', label: 'Prescriptions', icon: '📋' },
  { path: '/medicines', label: 'Medicines', icon: '💊' },
  { path: '/inventory', label: 'Inventory', icon: '📦' },
  { path: '/herbs', label: 'Herbs', icon: '🌿' },
  { path: '/sales', label: 'Sales', icon: '💰' },
  { path: '/appointments', label: 'Appointments', icon: '📅' },
  { path: '/reports', label: 'Reports', icon: '📈' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/patients?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="px-5 py-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-sarbloh-red tracking-tight">Sarbloh</h1>
          <p className="text-xs text-sarbloh-green font-medium mt-0.5">Ayurvedic Clinic</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sarbloh-green text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-sarbloh-red/10 text-sarbloh-red flex items-center justify-center font-semibold text-sm">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">{user?.fullName}</div>
              <div className="text-xs text-gray-400">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-sarbloh-red hover:bg-red-50 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 shadow-sm">
          <form onSubmit={handleSearch} className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients by name, code or phone..."
              className="w-full max-w-lg px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sarbloh-green focus:bg-white transition"
            />
          </form>
          <div className="text-sm text-gray-500 hidden sm:block whitespace-nowrap">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}