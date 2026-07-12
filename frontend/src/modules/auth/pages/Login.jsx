import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import LoginForm from "../components/LoginForm.jsx";
import ForgotPassword from "../components/ForgotPassword.jsx";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForgot, setShowForgot] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate("/dashboard", { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-page">
      {/* Decorative gradient blobs */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />
      <div className="login-blob login-blob-3" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon" style={{ width: 44, height: 44, fontSize: "1.2rem" }}>T</div>
          <span className="login-brand">TransitOps</span>
        </div>

        {showForgot ? (
          <ForgotPassword onBack={() => setShowForgot(false)} />
        ) : (
          <>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Sign in to your account</h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.75rem", fontSize: "0.9rem" }}>
              Enter your credentials to continue
            </p>

            <LoginForm onSubmit={handleLogin} loading={loading} error={error} />

            <button
              type="button"
              className="forgot-link"
              onClick={() => setShowForgot(true)}
            >
              Forgot your password?
            </button>

            {/* Role access legend — matches mockup Section 0 */}
            <div style={{
              marginTop: "1.5rem", padding: "1rem", fontSize: "0.75rem",
              background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.12)",
              borderRadius: "8px", lineHeight: 1.8
            }}>
              <div style={{ fontWeight: 600, color: "var(--accent-color)", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.65rem" }}>
                Access is scoped by role after login
              </div>
              <div style={{ color: "var(--text-secondary)" }}>🔵 Fleet Manager → Fleet, Maintenance</div>
              <div style={{ color: "var(--text-secondary)" }}>🟢 Dispatcher → Dashboard, Trips</div>
              <div style={{ color: "var(--text-secondary)" }}>🟡 Safety Officer → Drivers, Compliance</div>
              <div style={{ color: "var(--text-secondary)" }}>🔴 Financial Analyst → Fuel & Expenses, Analytics</div>
            </div>

            {/* Demo credentials hint */}
            <div className="demo-hint">
              <span className="demo-hint-title">Demo Credentials</span>
              <span>admin@transitops.com / admin123</span>
            </div>
          </>
        )}
      </div>

      {/* Footer branding */}
      <div style={{
        position: "absolute", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
        fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center", letterSpacing: "0.05em"
      }}>
        TRANSITOPS © 2026 • RBAC ENABLED
      </div>
    </div>
  );
}
