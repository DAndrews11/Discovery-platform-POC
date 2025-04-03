import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WelcomePage from './pages/WelcomePage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import CreateClaimPage from './pages/CreateClaimPage';
import SearchPage from './pages/SearchPage';
import ClaimAdminPage from './pages/ClaimAdminPage';
import ClaimValidationPage from './pages/ClaimValidationPage';
import ValidationReportPage from './pages/ValidationReportPage';
import RTIRequestPage from './pages/RTIRequestPage';
import RTIRequestDetailPage from './pages/RTIRequestDetailPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<WelcomePage />} />
              <Route path="/claims/new" element={<CreateClaimPage />} />
              <Route path="/claims/search" element={<SearchPage />} />
              <Route path="/claims/:id" element={<ClaimAdminPage />} />
              <Route path="/claims/:id/validate" element={<ClaimValidationPage />} />
              <Route path="/claims/:id/rti" element={<RTIRequestPage />} />
              <Route path="/claims/:id/rti-request/:requestId" element={<RTIRequestDetailPage />} />
              <Route path="/claims/:claimId/validation-report/:reportId" element={<ValidationReportPage />} />
            </Route>
          </Route>

          {/* Catch-all route - redirect to home */}
          <Route path="*" element={<WelcomePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 