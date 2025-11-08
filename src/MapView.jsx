import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AlertButtons from "./AlertButtons";

const MapView = () => {
  const [map, setMap] = useState(null);
  const [alertType, setAlertType] = useState(null);

  useEffect(() => {
    const m = L.map("map").setView([51.0447, -114.0719], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(m);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        m.setView([latitude, longitude], 14);
        L.marker([latitude, longitude]).addTo(m).bindPopup("📍 You are here");
      });
    }

    setMap(m);
    return () => {
      m.remove();
    };
  }, []);

  useEffect(() => {
    if (!map || !alertType) return;

    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;
      const message = `Confirm report for "${alertType}" at this location?`;

      if (window.confirm(message)) {
        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(`🚨 ${alertType} reported here.`)
          .openPopup();

        // TODO: send data to backend
        console.log("Report submitted:", { alertType, lat, lng });
      } else {
        console.log("Report cancelled");
      }

      setAlertType(null);
      map.off("click", handleMapClick);
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, alertType]);

  return (
    <div>
      <AlertButtons onSelect={setAlertType} />
      <div id="map" style={{ height: "80vh", width: "100%" }}></div>
    </div>
  );
};

export default MapView;
