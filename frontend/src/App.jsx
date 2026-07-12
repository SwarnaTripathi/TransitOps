import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./shared/context/AuthContext.jsx";
import MainLayout from "./shared/components/MainLayout.jsx";
import ProtectedRoute from "./shared/components/ProtectedRoute.jsx";
import Login from "./modules/auth/pages/Login.jsx";
import Unauthorized from "./modules/auth/pages/Unauthorized.jsx";
import Dashboard from "./modules/dashboard/pages/Dashboard.jsx";
import NotFound from "./shared/components/NotFound.jsx";

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
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Placeholder routes for other team members' modules */}
              <Route path="/vehicles" element={<div className="placeholder-page"><h2>🚛 Vehicles Registry</h2><p style={{color:"var(--text-secondary)"}}>Module coming soon — assigned to another team member.</p></div>} />
              <Route path="/drivers" element={<div className="placeholder-page"><h2>👥 Driver Profiles</h2><p style={{color:"var(--text-secondary)"}}>Module coming soon — assigned to another team member.</p></div>} />
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
