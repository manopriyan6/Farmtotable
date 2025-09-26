import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/farmer/DashboardPage';
import { ProductsPage } from './pages/farmer/ProductsPage';
import { ScannerPage } from './pages/customer/ScannerPage';
import { ProductPage } from './pages/ProductPage';

const AppRoutes: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-green-600 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading FarmConnect</h2>
          <p className="text-gray-600">Connecting you to fresh, local produce...</p>
        </div>
      </div>
    );
  }

  // Prevent navigation loops by checking auth state properly
  const getDefaultRoute = () => {
    if (!user || !profile) return <HomePage />;
    return profile.role === 'farmer' ? <Navigate to="/dashboard" replace /> : <Navigate to="/scanner" replace />;
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={getDefaultRoute()} />
        <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
        <Route path="/product/:productId" element={<ProductPage />} />
        
        {/* Farmer Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="farmer">
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute role="farmer">
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        
        {/* Customer Routes */}
        <Route
          path="/scanner"
          element={
            <ProtectedRoute role="customer">
              <ScannerPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;