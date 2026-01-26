import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
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
    <div style={{ maxWidth: 360, margin: "80px auto", padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
      <h2>Admin Login</h2>
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
        <button disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
        {error && <div style={{ color: "crimson" }}>{String(error)}</div>}
      </form>
    </div>
  );
}
