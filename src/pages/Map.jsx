import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { personIcon, alertIcon } from "../components/CustomIcon";
import AlertMarker from "../components/AlertMarker";
import { createAlert, fetchAlerts } from "../lib/alerts";
import { supabase } from "../lib/supabaseClient";

const MapView = () => {
  const [map, setMap] = useState(null);
  const [alertMarker, showMarker] = useState(false);
  const [markerPos, setMarkerPos] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
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

  useEffect(() => {
    let isMounted = true;

    const syncLogin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!isMounted) return;
      console.log("[Map] Session check:", session ? "Logged in" : "Not logged in", "User ID:", session?.user?.id);
      setIsLoggedIn(!!session);
      setUserId(session?.user?.id ?? null);
    };

    syncLogin();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      console.log("[Map] Auth state changed:", _event, "Session:", session ? "Active" : "None", "User ID:", session?.user?.id);
      setIsLoggedIn(!!session);
      setUserId(session?.user?.id ?? null);
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const specifyAlert = async (type) => {
    showMarker(false);

    if (!isLoggedIn || !userId) {
      showStatus("Unable to make alert. Please log in first.", "error");
      return;
    }

    if (type === "Cancel" || !markerPos || !map || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      console.log("[Map] Creating alert with coords:", { lat: markerPos.lat, lng: markerPos.lng });
      const newAlert = await createAlert({
        type,
        latitude: markerPos.lat,
        longitude: markerPos.lng,
        created_by: userId,
      });
      console.log("[Map] Alert created:", newAlert);
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
      console.log("[Map] Click detected - isLoggedIn:", isLoggedIn, "userId:", userId);
      if (!isLoggedIn || !userId) {
        showStatus("Unable to make alert. Please log in first.", "error");
        return;
      }
      setMarkerPos(e.latlng);
      showMarker(true);
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, isLoggedIn, userId]);

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
      console.log("[Map] Rendering alert:", alert);
      if (alert.latitude && alert.longitude) {
        console.log("[Map] Adding marker at:", alert.latitude, alert.longitude);
        L.marker([alert.latitude, alert.longitude], { icon: alertIcon })
          .addTo(alertLayerRef.current)
          .bindPopup(`🚨 ${alert.type} reported here.`);
      } else {
        console.warn("[Map] Alert missing coordinates:", alert);
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
