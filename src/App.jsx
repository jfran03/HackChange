import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Member from "./pages/Member";
import AboutUs from "./pages/AboutUs";
import MapView from "./pages/Map";
import ChatWidget from "./components/ChatWidget";

const AppContent = () => {
  const navigate = useNavigate();

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
      <ChatWidget />
      <Routes>
        <Route path="/" element={<MapView />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;