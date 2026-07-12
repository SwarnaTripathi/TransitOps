import { useState } from "react";

export default function LoginForm({ onSubmit, loading, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Admin");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      onSubmit(email.trim(), password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {error && (
        <div className="login-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="login-email">Email Address</label>
        <input
          id="login-email"
          type="email"
          className="form-input"
          placeholder="you@transitops.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          autoFocus
        />
      </div>

      <div className="form-group">
        <label htmlFor="login-role">Sign in as</label>
        <select
          id="login-role"
          className="form-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Admin">Admin</option>
          <option value="Safety Officer">Safety Officer</option>
          <option value="Financial Analyst">Financial Analyst</option>
          <option value="Driver">Driver</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="login-password">Password</label>
        <div className="password-wrapper">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            className="form-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            minLength={6}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary login-btn"
        disabled={loading || !email.trim() || !password.trim()}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}
