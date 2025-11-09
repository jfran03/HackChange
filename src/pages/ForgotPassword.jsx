import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "../styles/Login.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/login`,
        }
      );
      if (resetError) throw resetError;
      setMessage("Password reset email sent. Check your inbox for further instructions.");
    } catch (err) {
      console.error("Password reset failed:", err);
      setError(err.message || "Unable to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Reset Password</h1>
        <p className="login-subtitle">Enter your account email</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <p className="form-error">{error}</p>}
          {message && <p className="form-success">{message}</p>}

          <div className="form-group">
            <label htmlFor="reset-email">Email</label>
            <input
              type="email"
              id="reset-email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
          <button
            type="button"
            className="login-button secondary"
            onClick={() => navigate("/login")}
          >
            Back to login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
