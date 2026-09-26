import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProductsPage } from './pages/products/ProductsPage';
import { ReceiptsPage } from './pages/operations/ReceiptsPage';
import { DeliveriesPage } from './pages/operations/DeliveriesPage';
import { TransfersPage } from './pages/operations/TransfersPage';
import { AdjustmentsPage } from './pages/adjustments/AdjustmentsPage';
import { LedgerPage } from './pages/ledger/LedgerPage';
import { WarehousesPage } from './pages/settings/WarehousesPage';
import { ProfilePage } from './pages/settings/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const App = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <InventoryProvider>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Enterprise Layout Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="operations/receipts" element={<ReceiptsPage />} />
              <Route path="operations/deliveries" element={<DeliveriesPage />} />
              <Route path="operations/transfers" element={<TransfersPage />} />
              <Route path="adjustments" element={<AdjustmentsPage />} />
              <Route path="ledger" element={<LedgerPage />} />
              <Route path="settings/warehouses" element={<WarehousesPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </InventoryProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
