import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsListPage from './pages/patients/PatientsListPage';
import PatientFormPage from './pages/patients/PatientFormPage';
import PatientDetailPage from './pages/patients/PatientDetailPage';
import LogVisitPage from './pages/visits/LogVisitPage';
import MainLayout from './layouts/MainLayout';
import CreatePrescriptionPage from './pages/prescriptions/CreatePrescriptionPage';
import MedicinesListPage from './pages/medicines/MedicinesListPage';
import MedicineFormPage from './pages/medicines/MedicineFormPage';
import InventoryPage from './pages/inventory/InventoryPage';
import AdjustStockPage from './pages/inventory/AdjustStockPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sarbloh-cream">
        <div className="text-sarbloh-green">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
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
                <Route path="*" element={<Navigate to="/" replace />} />
                <Route path="/prescriptions/new" element={<CreatePrescriptionPage />} />
                <Route path="/medicines" element={<MedicinesListPage />} />
                <Route path="/medicines/new" element={<MedicineFormPage />} />
                <Route path="/medicines/:id/edit" element={<MedicineFormPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/inventory/adjust" element={<AdjustStockPage />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}