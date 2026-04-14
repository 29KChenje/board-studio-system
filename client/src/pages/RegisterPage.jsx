import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reach the backend. Make sure the API is running on http://localhost:5000.");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Board Studio System</p>
        <h1>Create account</h1>
        <p className="muted">Create a customer account and start building board-cutting projects.</p>
        <div className="info-note">Admin access is restricted. New registrations are always created as customer accounts.</div>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} />
        <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} />
        {error ? <p className="error-text">{error}</p> : null}
        <button type="submit">Register</button>
        <p className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
