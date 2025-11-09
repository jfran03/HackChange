import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { personIcon, alertIcon, houseIcon } from "../components/CustomIcon";
import AlertMarker from "../components/AlertMarker";
import { createAlert, fetchAlerts, resolveAlert, unresolveAlert } from "../lib/alerts";
import { fetchShelters } from "../lib/overpass";
import { supabase } from "../lib/supabaseClient";
import { isApprovedMember } from "../lib/members";
import "../styles/Map.css";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isApprovedMemberUser, setIsApprovedMemberUser] = useState(false);
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

  useEffect(() => {
    let isMounted = true;

    const syncLogin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!isMounted) return;
      console.log("[Map] Session check:", session ? "Logged in" : "Not logged in", "User ID:", session?.user?.id);
      setIsLoggedIn(!!session);
      const currentUserId = session?.user?.id ?? null;
      setUserId(currentUserId);

      // Check if user is approved member
      if (currentUserId) {
        const approved = await isApprovedMember(currentUserId);
        if (isMounted) {
          setIsApprovedMemberUser(approved);
          console.log("[Map] User is approved member:", approved);
        }
      } else {
        setIsApprovedMemberUser(false);
      }
    };

    syncLogin();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      console.log("[Map] Auth state changed:", _event, "Session:", session ? "Active" : "None", "User ID:", session?.user?.id);
      setIsLoggedIn(!!session);
      const currentUserId = session?.user?.id ?? null;
      setUserId(currentUserId);

      // Check if user is approved member
      if (currentUserId) {
        const approved = await isApprovedMember(currentUserId);
        if (isMounted) {
          setIsApprovedMemberUser(approved);
          console.log("[Map] User is approved member:", approved);
        }
      } else {
        setIsApprovedMemberUser(false);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleResolveAlert = async (alertId, currentlyResolved) => {
    if (!isApprovedMemberUser) {
      showStatus("Only approved members can resolve alerts.", "error");
      return;
    }

    try {
      console.log("[Map] Resolving alert:", { alertId, currentlyResolved, userId, isApprovedMemberUser });

      if (currentlyResolved) {
        await unresolveAlert(alertId);
        showStatus("Alert reopened.", "success");
      } else {
        await resolveAlert(alertId, userId);
        showStatus("Alert marked as resolved.", "success");
      }

      // Refresh alerts
      const updatedAlerts = await fetchAlerts();
      setAlerts(updatedAlerts);
    } catch (error) {
      console.error("Failed to update alert - Full error:", error);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);
      showStatus(`Unable to update alert: ${error.message}`, "error");
    }
  };

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
      console.log("[Map] Rendering alert:", alert);
      if (alert.latitude && alert.longitude) {
        console.log("[Map] Adding marker at:", alert.latitude, alert.longitude);

        // Find closest shelter to this alert
        let closestShelter = null;
        let minDistance = Infinity;

        shelters.forEach((shelter) => {
          if (shelter.latitude && shelter.longitude) {
            const distance = map.distance(
              [alert.latitude, alert.longitude],
              [shelter.latitude, shelter.longitude]
            );
            if (distance < minDistance) {
              minDistance = distance;
              closestShelter = shelter;
            }
          }
        });

        // Build popup HTML with alert info and closest shelter
        const isResolved = alert.resolved || false;
        const statusBadge = isResolved
          ? '<span class="alert-popup-status-badge resolved">✓ Resolved</span>'
          : '<span class="alert-popup-status-badge active">Active</span>';

        let popupHtml = `
          <div class="alert-popup ${isResolved ? 'resolved' : ''}">
            <div class="alert-popup-header">
              <strong>🚨 ${escapeHtml(alert.type)}</strong>
              ${statusBadge}
            </div>
        `;

        if (closestShelter) {
          const distanceText = formatDistance(minDistance);
          popupHtml += `
            <div class="alert-popup-shelter">
              <div class="alert-popup-shelter-title">📍 Nearest Shelter:</div>
              <div class="alert-popup-shelter-name">${escapeHtml(closestShelter.name)}</div>
              ${closestShelter.address ? `<div class="alert-popup-shelter-address">${escapeHtml(closestShelter.address)}</div>` : ""}
              ${distanceText ? `<div class="alert-popup-shelter-distance">${distanceText}</div>` : ""}
            </div>
          `;
        } else {
          popupHtml += `
            <div class="alert-popup-no-shelter">
              No nearby shelters found in current view.
            </div>
          `;
        }

        // Add resolve button for approved members
        if (isApprovedMemberUser) {
          const buttonText = isResolved ? 'Reopen Alert' : 'Mark as Resolved';
          const buttonClass = isResolved ? 'reopen' : 'resolve';
          popupHtml += `
            <button
              class="alert-popup-resolve-btn ${buttonClass}"
              data-alert-id="${alert.id}"
              data-resolved="${isResolved}"
            >
              ${buttonText}
            </button>
          `;
        }

        popupHtml += `</div>`;

        const marker = L.marker([alert.latitude, alert.longitude], { icon: alertIcon })
          .addTo(alertLayerRef.current)
          .bindPopup(popupHtml);

        // Add click handler for resolve button
        marker.on('popupopen', () => {
          const popup = marker.getPopup();
          const popupElement = popup.getElement();
          const resolveBtn = popupElement?.querySelector('.alert-popup-resolve-btn');

          if (resolveBtn) {
            resolveBtn.addEventListener('click', () => {
              const alertId = resolveBtn.getAttribute('data-alert-id');
              const currentlyResolved = resolveBtn.getAttribute('data-resolved') === 'true';
              handleResolveAlert(alertId, currentlyResolved);
            });
          }
        });
      } else {
        console.warn("[Map] Alert missing coordinates:", alert);
      }
    });
  }, [alerts, map, shelters]);

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