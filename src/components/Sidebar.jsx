import { useState } from "react";

const Sidebar = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState("Home");

  const topMenuItems = [
    { name: "Home", icon: "🏠" },
    { name: "Member", icon: "👥" },
    { name: "Map", icon: "🗺️" },
  ];

  const handleClick = (itemName) => {
    setActiveItem(itemName);
    if (onNavigate) {
      onNavigate(itemName);
    }
  };

  return (
    <div className="sidebar">
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
          onClick={() => handleClick("Log in")}
          className={`sidebar-item ${activeItem === "Log in" ? "active" : ""}`}
        >
          <span className="sidebar-icon">🔐</span>
          <span className="sidebar-label">Log in</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <p>&copy; 2024 STREET AID</p>
      </div>
    </div>
  );
};

export default Sidebar;
