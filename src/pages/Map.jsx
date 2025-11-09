import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { personIcon, alertIcon, houseIcon } from "../components/CustomIcon";
import AlertMarker from "../components/AlertMarker";
import { createAlert, fetchAlerts } from "../lib/alerts";
import { fetchShelters } from "../lib/overpass";

const formatDistance = (meters) => {
  if (typeof meters !== "number" || Number.isNaN(meters)) {
    return null;
  }

  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km away`;
  }

  if (meters >= 100) {
    return `${(meters / 1000).toFixed(2)} km away`;
  }

  return `${Math.round(meters)} m away`;
};

const escapeHtml = (value = "") =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const serviceText = (value, serviceName) => {
  if (value === true) {
    return `Provides ${serviceName}`;
  }

  if (value === false) {
    return `Does not provide ${serviceName}`;
  }

  return `${serviceName} availability unknown`;
};

const MapView = () => {
  const [map, setMap] = useState(null);
  const [alertMarker, showMarker] = useState(false);
  const [markerPos, setMarkerPos] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [shelters, setShelters] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState(null);
  const alertLayerRef = useRef(null);
  const shelterLayerRef = useRef(null);
  const messageTimeoutRef = useRef(null);
  const shelterAbortRef = useRef(null);

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
    shelterLayerRef.current = L.layerGroup().addTo(m);
    setMap(m);
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      if (shelterAbortRef.current) {
        shelterAbortRef.current.abort();
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
    if (!map) return;

    let isMounted = true;

    const loadShelters = async () => {
      if (!map) return;

      if (shelterAbortRef.current) {
        shelterAbortRef.current.abort();
      }

      const controller = new AbortController();
      shelterAbortRef.current = controller;

      try {
        const results = await fetchShelters(map.getBounds(), {
          signal: controller.signal,
        });

        if (isMounted) {
          setShelters(results);
        }
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
        console.error("Failed to load nearby shelters", error);
        showStatus("Unable to load nearby shelters.", "error");
      }
    };

    loadShelters();

    const handleMoveEnd = () => {
      loadShelters();
    };

    map.on("moveend", handleMoveEnd);

    return () => {
      isMounted = false;
      map.off("moveend", handleMoveEnd);
      if (shelterAbortRef.current) {
        shelterAbortRef.current.abort();
      }
    };
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

  useEffect(() => {
    if (!map || !shelterLayerRef.current) return;

    shelterLayerRef.current.clearLayers();

    const center = map.getCenter();

    shelters.forEach((location) => {
      if (location.latitude && location.longitude) {
        const metersAway = map.distance(center, [location.latitude, location.longitude]);
        const distanceText = formatDistance(metersAway);

        const capacityText = location.capacity ? `${location.capacity}` : "Unknown";
        const statusText = location.status || "Status unknown";
        const foodText = serviceText(location.providesFood, "Food & Water");
        const medicalText = serviceText(location.providesMedical, "Medical Services");
        const descriptionText =
          location.description ||
          "No additional information is available for this shelter.";

        const popupHtml = `
          <div class="shelter-popup">
            <div class="shelter-popup__header">
              <div class="shelter-popup__thumbnail">Shelter</div>
              <div class="shelter-popup__headline">
                <div class="shelter-popup__title">${escapeHtml(location.name)}</div>
                ${location.address ? `<div class="shelter-popup__address">${escapeHtml(location.address)}</div>` : ""}
                ${distanceText ? `<div class="shelter-popup__distance">${distanceText}</div>` : ""}
              </div>
            </div>
            <div class="shelter-popup__body">
              <div class="shelter-popup__meta">
                <div><span class="shelter-popup__label">Capacity:</span> ${escapeHtml(capacityText)}<span class="shelter-popup__status">${statusText ? ` · ${escapeHtml(statusText)}` : ""}</span></div>
                <div>${escapeHtml(foodText)}</div>
                <div>${escapeHtml(medicalText)}</div>
              </div>
              <div class="shelter-popup__description">${escapeHtml(descriptionText)}</div>
            </div>
          </div>
        `;

        shelterLayerRef.current.addLayer(
          L.marker([location.latitude, location.longitude], { icon: houseIcon }).bindPopup(
            popupHtml,
            {
              className: "shelter-popup__container",
              maxWidth: 320,
            }
          )
        );
      }
    });
  }, [shelters, map]);

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