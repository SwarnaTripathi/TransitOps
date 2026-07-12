import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./shared/context/AuthContext.jsx";
import MainLayout from "./shared/components/MainLayout.jsx";
import ProtectedRoute from "./shared/components/ProtectedRoute.jsx";
import Login from "./modules/auth/pages/Login.jsx";
import Unauthorized from "./modules/auth/pages/Unauthorized.jsx";
import NotFound from "./shared/components/NotFound.jsx";

// Module pages
import DashboardView from "./shared/components/DashboardView.jsx";
import VehiclesPage from "./modules/vehicles/VehiclesPage.jsx";
import DriversPage from "./modules/drivers/DriversPage.jsx";
import TripsPage from "./modules/trips/TripsPage.jsx";
import MaintenancePage from "./modules/maintenance/MaintenancePage.jsx";
import FuelExpensePage from "./modules/fuelExpense/FuelExpensePage.jsx";
import ReportsPage from "./modules/reports/ReportsPage.jsx";
import SettingsPage from "./modules/settings/SettingsPage.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardView />} />
              <Route path="/vehicles" element={<VehiclesPage />} />
              <Route path="/drivers" element={<DriversPage />} />
              <Route path="/trips" element={<TripsPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/fuel" element={<FuelExpensePage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Redirects and fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
