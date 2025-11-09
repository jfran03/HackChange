import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/Registration.css";

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

  const handleNavigation = (itemName) => {
    if (itemName === "Log in") {
      navigate("/login");
    } else if (itemName === "Member") {
      navigate("/member");
    } else if (itemName === "Home") {
      navigate("/");
    } else if (itemName === "Map") {
      navigate("/"); // Map button should return to the main App map view
    } else if (itemName === "About Us") {
      navigate("/about");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    console.log("New account:", formData);
    alert("Account created successfully!");
    navigate("/login");
  };

  return (
    <div>
      <Sidebar onNavigate={handleNavigation} />
      <div className="registration-container">
        <div className="registration-card">
          <h1 className="registration-title">Create Your Account</h1>
          <p className="registration-subtitle">
            Sign up to access STREET AID resources and support tools.
          </p>

          {errors.length > 0 && (
            <div className="form-errors">
              <ul>
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
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
              />
              <p className="field-helper">Use at least 8 characters for security.</p>
            </div>

            <button type="submit" className="registration-button">
              Sign Up
            </button>
          </form>

          <div className="registration-footer">
            <p>
              Already have an account?{" "}
              <button type="button" className="footer-link" onClick={() => navigate("/login")}>
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
