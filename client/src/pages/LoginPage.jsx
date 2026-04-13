import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reach the backend. Make sure the API is running on http://localhost:5000.");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Board Studio System</p>
        <h1>Welcome back</h1>
        <p className="muted">Manage client projects, cutting plans, and live cabinet previews.</p>
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} />
        <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} />
        {error ? <p className="error-text">{error}</p> : null}
        <button type="submit">Login</button>
        <p className="muted">
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
