import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      alert("Login successful!");
      localStorage.setItem("isLoggedIn", "true");
      window.dispatchEvent(new Event("authChange"));
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMessage(err.message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">STREET AID💙</h1>
          <p className="login-subtitle">Welcome back</p>

          <form onSubmit={handleSubmit} className="login-form">
            {errorMessage && <p className="form-error">{errorMessage}</p>}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Signing in..." : "Log In"}
            </button>
            <button
              type="button"
              className="login-button secondary"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
          </form>

          <div className="login-toggle">
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="toggle-button"
              >
                Register Now
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
