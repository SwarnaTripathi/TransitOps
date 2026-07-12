import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-icon">🔒</div>
        <h1 className="error-code">403</h1>
        <h2>Access Denied</h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: 400, margin: "0.75rem auto 2rem" }}>
          You do not have permission to view this page. 
          Contact your administrator if you believe this is an error.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
