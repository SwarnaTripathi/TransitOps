import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import LoginForm from "../components/LoginForm.jsx";
import RegisterForm from "../components/RegisterForm.jsx";
import ForgotPassword from "../components/ForgotPassword.jsx";

export default function Login() {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState("login"); // 'login', 'register', 'forgot'

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

  const handleRegister = async (userData) => {
    setLoading(true);
    setError(null);
    const result = await register(userData);
    setLoading(false);
    if (result.success) {
      navigate("/dashboard", { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-page" style={{ 
      background: "#0a0a0a", // Deep black background
      color: "#ffffff",
      fontFamily: "'Outfit', sans-serif"
    }}>
      {/* Decorative gradient blobs - Yellow & Orange */}
      <div className="login-blob" style={{ background: "radial-gradient(circle, rgba(250,204,21,0.15) 0%, rgba(0,0,0,0) 70%)", top: "-10%", left: "-10%" }} />
      <div className="login-blob" style={{ background: "radial-gradient(circle, rgba(234,179,8,0.1) 0%, rgba(0,0,0,0) 70%)", bottom: "-10%", right: "-10%" }} />

      <div className="login-card" style={{ 
        background: "rgba(15,15,15,0.85)", 
        border: "1px solid rgba(250,204,21,0.2)",
        boxShadow: "0 0 40px rgba(250,204,21,0.05)"
      }}>
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon" style={{ 
            width: 44, height: 44, fontSize: "1.2rem", 
            background: "linear-gradient(135deg, #facc15 0%, #eab308 100%)",
            color: "#000",
            boxShadow: "0 0 15px rgba(250,204,21,0.4)"
          }}>T</div>
          <span className="login-brand" style={{ color: "#facc15" }}>TransitOps</span>
        </div>

        {view === "forgot" ? (
          <ForgotPassword onBack={() => setView("login")} />
        ) : view === "register" ? (
          <>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem", color: "#fff" }}>Create an account</h1>
            <p style={{ color: "#a1a1aa", marginBottom: "1.75rem", fontSize: "0.9rem" }}>
              Join the fleet management platform
            </p>
            <RegisterForm onSubmit={handleRegister} loading={loading} error={error} />
            <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
              <span style={{ color: "#a1a1aa" }}>Already have an account? </span>
              <button type="button" onClick={() => setView("login")} style={{ color: "#facc15", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                Sign in
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem", color: "#fff" }}>Sign in to your account</h1>
            <p style={{ color: "#a1a1aa", marginBottom: "1.75rem", fontSize: "0.9rem" }}>
              Enter your credentials to continue
            </p>

            <LoginForm onSubmit={handleLogin} loading={loading} error={error} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
              <button
                type="button"
                className="forgot-link"
                onClick={() => setView("forgot")}
                style={{ color: "#a1a1aa" }}
              >
                Forgot password?
              </button>
              <button type="button" onClick={() => setView("register")} style={{ color: "#facc15", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}>
                Create account
              </button>
            </div>

            {/* Role access legend */}
            <div style={{
              marginTop: "1.5rem", padding: "1rem", fontSize: "0.75rem",
              background: "rgba(250,204,21,0.05)", border: "1px solid rgba(250,204,21,0.12)",
              borderRadius: "8px", lineHeight: 1.8
            }}>
              <div style={{ fontWeight: 600, color: "#facc15", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.65rem" }}>
                Access is scoped by role after login
              </div>
              <div style={{ color: "#a1a1aa" }}><span style={{ color: "#facc15" }}>•</span> Admin → Fleet, Maintenance</div>
              <div style={{ color: "#a1a1aa" }}><span style={{ color: "#facc15" }}>•</span> Safety Officer → Drivers, Compliance</div>
              <div style={{ color: "#a1a1aa" }}><span style={{ color: "#facc15" }}>•</span> Financial Analyst → Fuel & Expenses</div>
            </div>
          </>
        )}
      </div>

      {/* Footer branding */}
      <div style={{
        position: "absolute", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
        fontSize: "0.7rem", color: "#52525b", textAlign: "center", letterSpacing: "0.05em"
      }}>
        TRANSITOPS © 2026 • RBAC ENABLED
      </div>
      
      {/* Overriding index.css colors for this specific page component via style injection */}
      <style>{`
        .login-page .btn-primary {
          background: linear-gradient(135deg, #facc15 0%, #eab308 100%) !important;
          color: #000 !important;
          border: none !important;
          font-weight: 700 !important;
        }
        .login-page .btn-primary:hover:not(:disabled) {
          box-shadow: 0 0 15px rgba(250,204,21,0.4) !important;
        }
        .login-page .form-input, .login-page .form-select {
          background: rgba(0,0,0,0.5) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: #fff !important;
        }
        .login-page .form-input:focus, .login-page .form-select:focus {
          border-color: #facc15 !important;
          box-shadow: 0 0 0 2px rgba(250,204,21,0.2) !important;
        }
        .login-page label {
          color: #d4d4d8 !important;
        }
      `}</style>
    </div>
  );
}
