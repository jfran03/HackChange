import React, { useEffect, useState } from "react";
import "../styles/AlertMarker.css";

const AlertMarker = ({ map, position, onSelect }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in after mount
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = (type) => {
    setIsVisible(false);
    // Wait for animation to complete before calling onSelect
    setTimeout(() => onSelect(type), 200);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`alert-backdrop ${isVisible ? "visible" : ""}`}
        onClick={() => handleSelect("Cancel")}
      />

      {/* Bottom Sheet */}
      <div className={`alert-sheet ${isVisible ? "visible" : ""}`}>
        {/* Content */}
        <div className="alert-sheet-content">
          <div className="alert-sheet-header">
            <h3 className="alert-sheet-title">Report an Alert</h3>
            <button
              className="alert-sheet-close"
              onClick={() => handleSelect("Cancel")}
            >
              ×
            </button>
          </div>

          <div className="alert-sheet-buttons">
            <button
              className="alert-button"
              onClick={() => handleSelect("Needs Shelter")}
            >
              <span className="alert-button-icon">🏠</span>
              <span>Needs Shelter</span>
            </button>

            <button
              className="alert-button"
              onClick={() => handleSelect("Needs Food")}
            >
              <span className="alert-button-icon">🍲</span>
              <span>Needs Food</span>
            </button>

            <button
              className="alert-button"
              onClick={() => handleSelect("Medical Assistance")}
            >
              <span className="alert-button-icon">🚑</span>
              <span>Medical Assistance</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AlertMarker;