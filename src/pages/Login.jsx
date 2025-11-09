import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login:", { email: formData.email, password: formData.password });
    // TODO: Implement login logic with Supabase
    alert("Login successful!");
    navigate("/");
  };

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

  return (
    <div>
      <Sidebar onNavigate={handleNavigation} />
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">STREET AID💙</h1>
          <p className="login-subtitle">Welcome back</p>

          <form onSubmit={handleSubmit} className="login-form">
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
              />
            </div>

            <button type="submit" className="login-button">
              Log In
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
