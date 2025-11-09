import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AlertMarker from "../components/AlertMarker";

const MapView = () => {
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [alertMarker, showMarker] = useState(false);
  const [markerPos, setMarkerPos] = useState(null);

  useEffect(() => {
    const m = L.map("map").setView([51.0447, -114.0719], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(m);

    // Center to user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        m.setView([latitude, longitude], 14);
        L.marker([latitude, longitude])
          .addTo(m)
          .bindPopup("📍 You are here");
      });
    }

    setMap(m);
    return () => {
      m.remove();
    };
  }, []);

  const specifyAlert = (type) => {
    showMarker(false);

    if (type !== "Cancel" && markerPos) {
      L.marker([markerPos.lat, markerPos.lng])
        .addTo(map)
        .bindPopup(`🚨 ${type} reported here.`)
        .openPopup();

      console.log(markerPos);
      console.log(type);
    }
  };

  useEffect(() => {
    if (!map) return;

    const handleMapClick = (e) => {
      setMarkerPos(e.latlng);
      showMarker(true);
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [map]);

  return (
    <div>
      {alertMarker && map && <AlertMarker map={map} position={markerPos} onSelect={specifyAlert} />}
      <div
        id="map"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100vh",
          width: "100%",
          zIndex: 0,
        }}
      ></div>
    </div>
  );
};

export default MapView;