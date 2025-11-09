import React, { useEffect, useState } from "react";

const AlertMarker = ({ map, position, onSelect }) => {
  const [pixelPosition, setPixelPosition] = useState(null);

  useEffect(() => {
    if (!map || !position) return;

    const updatePosition = () => {
      const point = map.latLngToContainerPoint(position);
      setPixelPosition(point);
    };

    updatePosition();
    map.on("move", updatePosition);
    map.on("zoom", updatePosition);

    return () => {
      map.off("move", updatePosition);
      map.off("zoom", updatePosition);
    };
  }, [map, position]);

  if (!pixelPosition) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: `${pixelPosition.x}px`,
        top: `${pixelPosition.y}px`,
        transform: "translate(-50%, -100%)",
        zIndex: 1000,
        pointerEvents: "auto",
      }}
      className="flex gap-2 bg-white p-2 rounded-lg shadow-lg mb-2"
    >
      <button className="btn" onClick={() => onSelect("Needs Shelter")}>
        🏠 Shelter
      </button>
      <button className="btn" onClick={() => onSelect("Needs Food")}>
        🍲 Food
      </button>
      <button className="btn" onClick={() => onSelect("Medical Assistance")}>
        🚑 Medical
      </button>
      <button className="btn" onClick={() => onSelect("Cancel")}>
        Cancel
      </button>
    </div>
  );
};

export default AlertMarker;