import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Registration.css";
import { supabase } from "../lib/supabaseClient";

const INITIAL_FORM = {
  username: "",
  email: "",
  phone: "",
  password: "",
};

const Registration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = [];
    if (!formData.username.trim()) newErrors.push("Username is required.");
    if (!formData.email.trim()) {
      newErrors.push("Email is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push("Please enter a valid email.");
    }
    if (!formData.phone.trim()) newErrors.push("Phone number is required.");
    if (!formData.password.trim()) newErrors.push("Password is required.");
    if (formData.password && formData.password.length < 8) {
      newErrors.push("Password must be at least 8 characters.");
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");
    if (!validate()) return;

    setLoading(true);
    try {
      // 1) Check username uniqueness (case-insensitive)
      const { data: existing, error: checkErr } = await supabase
        .from("profiles")
        .select("user_id")
        .ilike("username", formData.username.trim());
      if (checkErr) throw checkErr;
      if (existing && existing.length > 0) {
        setGlobalError("Username is already taken.");
        setLoading(false);
        return;
      }

      // 2) Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            role: "member",
            username: formData.username.trim(),
            phone: formData.phone.trim(),
          },
          emailRedirectTo: window.location.origin + "/login",
        },
      });
      if (signUpError) throw signUpError;

      const userId = signUpData.user?.id;
      if (!userId) throw new Error("Sign up failed: no user id.");

      // 3) Insert/Update profile row so account data lives in our table as well
      const { error: profileErr } = await supabase.from("profiles").upsert(
        [
          {
            user_id: userId,
            username: formData.username.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
          },
        ],
        {
          onConflict: "user_id",
        }
      );
      if (profileErr) throw profileErr;

      alert("Account created! Check your email to confirm before logging in.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setGlobalError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="registration-container">
        <div className="registration-card">
          <h1 className="registration-title">Create Your Account</h1>
          <p className="registration-subtitle">
            Sign up to access STREET AID resources and support tools.
          </p>

          {(errors.length > 0 || globalError) && (
            <div className="form-errors">
              {globalError && <p>{globalError}</p>}
              {errors.length > 0 && (
                <ul>
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <form className="registration-form simple" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <p className="field-helper">Use at least 8 characters for security.</p>
            </div>

            <button type="submit" className="registration-button" disabled={loading}>
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>

          <div className="registration-footer">
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="footer-link"
                onClick={() => navigate("/login")}
                disabled={loading}
              >
                Log In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
