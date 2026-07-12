import { useState } from "react";

export default function RegisterForm({ onSubmit, loading, error }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Driver");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && email.trim() && password.trim()) {
      onSubmit({ name: name.trim(), email: email.trim(), password, role });
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
        <label htmlFor="reg-name">Full Name</label>
        <input
          id="reg-name"
          type="text"
          className="form-input"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          autoFocus
        />
      </div>

      <div className="form-group">
        <label htmlFor="reg-email">Email Address</label>
        <input
          id="reg-email"
          type="email"
          className="form-input"
          placeholder="you@transitops.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="reg-role">Role</label>
        <select
          id="reg-role"
          className="form-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Fleet Manager">Fleet Manager</option>
          <option value="Dispatcher">Dispatcher</option>
          <option value="Safety Officer">Safety Officer</option>
          <option value="Financial Analyst">Financial Analyst</option>
          <option value="Driver">Driver</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="reg-password">Password</label>
        <div className="password-wrapper">
          <input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            className="form-input"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
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
        disabled={loading || !name.trim() || !email.trim() || !password.trim()}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  );
}
