import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsListPage from './pages/patients/PatientsListPage';
import PatientFormPage from './pages/patients/PatientFormPage';
import PatientDetailPage from './pages/patients/PatientDetailPage';
import LogVisitPage from './pages/visits/LogVisitPage';
import CreatePrescriptionPage from './pages/prescriptions/CreatePrescriptionPage';
import MedicinesListPage from './pages/medicines/MedicinesListPage';
import MedicineFormPage from './pages/medicines/MedicineFormPage';
import InventoryPage from './pages/inventory/InventoryPage';
import AdjustStockPage from './pages/inventory/AdjustStockPage';
import SalesListPage from './pages/sales/SalesListPage';
import CreateSalePage from './pages/sales/CreateSalePage';
import SaleDetailPage from './pages/sales/SaleDetailPage';
import HerbsListPage from './pages/herbs/HerbsListPage';
import HerbFormPage from './pages/herbs/HerbFormPage';
import HerbDetailPage from './pages/herbs/HerbDetailPage';
import AppointmentsListPage from './pages/appointments/AppointmentsListPage';
import BookAppointmentPage from './pages/appointments/BookAppointmentPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import PrintPrescriptionPage from './pages/print/PrintPrescriptionPage';
import PrintInvoicePage from './pages/print/PrintInvoicePage';
import MainLayout from './layouts/MainLayout';

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />

      {/* Print also requires login */}
      <Route
        path="/print/prescription/:id"
        element={
          <ProtectedRoute>
            <PrintPrescriptionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/print/invoice/:id"
        element={
          <ProtectedRoute>
            <PrintInvoicePage />
          </ProtectedRoute>
        }
      />

      {/* All confidential pages */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/patients" element={<PatientsListPage />} />
                <Route path="/patients/new" element={<PatientFormPage />} />
                <Route path="/patients/:id" element={<PatientDetailPage />} />
                <Route path="/patients/:id/edit" element={<PatientFormPage />} />
                <Route path="/visits/new" element={<LogVisitPage />} />
                <Route path="/prescriptions/new" element={<CreatePrescriptionPage />} />
                <Route path="/medicines" element={<MedicinesListPage />} />
                <Route path="/medicines/new" element={<MedicineFormPage />} />
                <Route path="/medicines/:id/edit" element={<MedicineFormPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/inventory/adjust" element={<AdjustStockPage />} />
                <Route path="/sales" element={<SalesListPage />} />
                <Route path="/sales/new" element={<CreateSalePage />} />
                <Route path="/sales/:id" element={<SaleDetailPage />} />
                <Route path="/herbs" element={<HerbsListPage />} />
                <Route path="/herbs/new" element={<HerbFormPage />} />
                <Route path="/herbs/:id" element={<HerbDetailPage />} />
                <Route path="/herbs/:id/edit" element={<HerbFormPage />} />
                <Route path="/appointments" element={<AppointmentsListPage />} />
                <Route path="/appointments/new" element={<BookAppointmentPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}