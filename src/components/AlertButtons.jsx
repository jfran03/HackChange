import React from "react";

const AlertButtons = ({ onSelect }) => {
  return (
    <div className="flex gap-2 justify-center mb-3">
      <button className="btn" onClick={() => onSelect("Needs Shelter")}>
        🏠 Shelter
      </button>
      <button className="btn" onClick={() => onSelect("Needs Food")}>
        🍲 Food
      </button>
      <button className="btn" onClick={() => onSelect("Medical Assistance")}>
        🚑 Medical
      </button>
    </div>
  );
};

export default AlertButtons;
