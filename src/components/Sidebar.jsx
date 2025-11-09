import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const Sidebar = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState("Home");
  const [isOpen, setIsOpen] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  const topMenuItems = [
    { name: "Home", icon: "🏠" },
    { name: "Map", icon: "🗺️" },
    { name: "Member", icon: "👥" },
    { name: "Shelter", icon: "🏢" },
    { name: "About Us", icon: "ℹ️" },
  ];

  useEffect(() => {
    const syncLoginState = () => {
      const saved = localStorage.getItem("isLoggedIn") === "true";
      setLoggedIn(saved);
    };

    syncLoginState();

    window.addEventListener("storage", syncLoginState);
    window.addEventListener("authChange", syncLoginState);

    return () => {
      window.removeEventListener("storage", syncLoginState);
      window.removeEventListener("authChange", syncLoginState);
    };
  }, []);

  const handleClick = async (itemName) => {
    setActiveItem(itemName);

    // ✅ Handle sign out
    if (itemName === "Sign out") {
      await supabase.auth.signOut();
      localStorage.removeItem("isLoggedIn");
      setLoggedIn(false);
      setActiveItem("Home");
      if (onNavigate) onNavigate("Home");
      window.dispatchEvent(new Event("authChange"));
      return;
    }

    // ✅ Handle normal navigation
    if (onNavigate) {
      onNavigate(itemName);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        className="hamburger-menu"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <div className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">STREET AID💙</h1>
        </div>

        <nav className="sidebar-nav">
          {topMenuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleClick(item.name)}
              className={`sidebar-item ${activeItem === item.name ? "active" : ""}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.name}</span>
            </button>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid #374151" }}>
          <button
            onClick={() =>
              handleClick(loggedIn ? "Sign out" : "Log in")
            }
            className={`sidebar-item ${activeItem === "Log in" ? "active" : ""}`}
          >
            <span className="sidebar-icon">🔐</span>
            <span className="sidebar-label">
              {loggedIn ? "Sign out" : "Log in"}
            </span>
          </button>
        </div>

        <div className="sidebar-footer">
          <p>&copy; 2024 STREET AID</p>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;
