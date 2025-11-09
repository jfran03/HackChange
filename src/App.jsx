import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AlertMarker from "./components/AlertMarker";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Member from "./pages/Member";
import AboutUs from "./pages/AboutUs";
import ChatWidget from "./components/ChatWidget";

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

  const handleNavigation = (itemName) => {
    if (itemName === "Log in") {
      navigate("/login");
    } else if (itemName === "Member") {
      navigate("/member");
    } else if (itemName === "Home") {
      navigate("/about");
    } else if (itemName === "Map") {
      navigate("/");
    } else if (itemName === "About Us") {
      navigate("/about");
    }
  };

  return (
    <div>
      {/* Sidebar + Alert system */}
      <Sidebar onNavigate={handleNavigation} />
      <AlertMarker onSelect={specifyAlert} show={alertMarker} />
      <ChatWidget />
      
      {/* Map container */}
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapView />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/member" element={<Member />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </Router>
  );
}

export default App;
