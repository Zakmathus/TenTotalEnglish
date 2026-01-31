import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/logo.png";
import "../styles/login.css";

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      nav("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tte-login">
      <div className="tte-login-inner">
        <div className="tte-hero">
          <div className="tte-logo-wrap">
            <img className="tte-hero-logo" src={logo} alt="Ten Total English" />
          </div>

          <h1 className="tte-welcome">Welcome to Ten Total English</h1>
          <p className="tte-sub">Sign in to continue to the Admin Panel</p>
        </div>

        <div className="tte-card" role="region" aria-label="Admin Login">
          <h2 className="tte-card-title">Admin Login</h2>

          <form onSubmit={onSubmit} className="tte-form">
            {/* Username */}
            <label className="tte-field" aria-label="Username">
              <span className="tte-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 21a8 8 0 1 0-16 0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>

              <input
                className="tte-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                autoComplete="username"
              />
            </label>

            {/* Password */}
            <label className="tte-field" aria-label="Password">
              <span className="tte-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 11V8a5 5 0 0 1 10 0v3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6 11h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>

              <input
                className="tte-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                autoComplete="current-password"
              />
            </label>

            <button className="tte-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Log In"}
              <span className="tte-btn-arrow" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>

            {error && <div className="tte-error">{String(error)}</div>}

            <div className="tte-help">By signing in, you agree to the terms of service.</div>
          </form>
        </div>
      </div>
    </div>
  );
}
