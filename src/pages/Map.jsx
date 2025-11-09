import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { personIcon, alertIcon } from "../components/CustomIcon";
import AlertMarker from "../components/AlertMarker";
import { createAlert, fetchAlerts } from "../lib/alerts";

const MapView = () => {
  const [map, setMap] = useState(null);
  const [alertMarker, showMarker] = useState(false);
  const [markerPos, setMarkerPos] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState(null);
  const alertLayerRef = useRef(null);
  const messageTimeoutRef = useRef(null);

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

        L.marker([latitude, longitude], { icon: personIcon })
          .addTo(m)
          .bindPopup("📍 You are here")
          .openPopup();
    
      });
    }

    alertLayerRef.current = L.layerGroup().addTo(m);
    setMap(m);
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      m.remove();
    };
  }, []);

  const showStatus = (message, type) => {
    setStatusMessage(message);
    setStatusType(type);
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setStatusMessage("");
      setStatusType(null);
    }, 4000);
  };

  const specifyAlert = async (type) => {
    showMarker(false);

    if (type === "Cancel" || !markerPos || !map || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const newAlert = await createAlert({
        type,
        latitude: markerPos.lat,
        longitude: markerPos.lng,
      });
      setAlerts((prev) => [newAlert, ...prev]);
      showStatus("Alert saved to STREET AID.", "success");
    } catch (error) {
      console.error("Failed to save alert", error);
      showStatus("Unable to save alert. Please try again.", "error");
    } finally {
      setIsSaving(false);
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

  useEffect(() => {
    if (!map) return;

    const loadAlerts = async () => {
      try {
        const existingAlerts = await fetchAlerts();
        setAlerts(existingAlerts);
      } catch (error) {
        console.error("Failed to load alerts", error);
        showStatus("Unable to load existing alerts.", "error");
      }
    };

    loadAlerts();
  }, [map]);

  useEffect(() => {
    if (!map || !alertLayerRef.current) return;

    alertLayerRef.current.clearLayers();

    alerts.forEach((alert) => {
      if (alert.latitude && alert.longitude) {
        L.marker([alert.latitude, alert.longitude], { icon: alertIcon })
          .addTo(alertLayerRef.current)
          .bindPopup(`🚨 ${alert.type} reported here.`);
      }
    });
  }, [alerts, map]);

  return (
    <div>
      {statusMessage && (
        <div className={`alert-status ${statusType === "error" ? "error" : "success"}`}>
          {statusMessage}
        </div>
      )}
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
