import { useState } from "react";
import { forgotPasswordApi } from "../api/authApi.js";

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await forgotPasswordApi(email.trim());
      setMessage(response.message);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2 style={{ marginBottom: "0.5rem" }}>Reset Password</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {message && (
        <div className="login-success">
          <span>✅</span>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="login-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="forgot-email">Email Address</label>
          <input
            id="forgot-email"
            type="email"
            className="form-input"
            placeholder="you@transitops.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary login-btn"
          disabled={loading || !email.trim()}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <button
        type="button"
        className="back-to-login"
        onClick={onBack}
      >
        ← Back to Login
      </button>
    </div>
  );
}
