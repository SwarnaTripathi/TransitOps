import { useNavigate } from "react-router-dom";

export default function ErrorPage({ code = 500, title = "Something went wrong", message }) {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-icon">💥</div>
        <h1 className="error-code">{code}</h1>
        <h2>{title}</h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: 400, margin: "0.75rem auto 2rem" }}>
          {message || "An unexpected error occurred. Please try again later."}
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
