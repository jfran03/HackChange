import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Member from "./pages/Member";
import AboutUs from "./pages/AboutUs";
import MapView from "./pages/Map";
import ChatWidget from "./components/ChatWidget";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Shelter from "./pages/Shelter";

const AppContent = () => {
  const navigate = useNavigate();
  const RequireAuth = ({ children }) => {
    const isLoggedIn =
      typeof window !== "undefined" && localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const handleNavigation = (itemName) => {
    if (itemName === "Log in") {
      navigate("/login");
    } else if (itemName === "Member") {
      navigate("/member");
    } else if (itemName === "Shelter") {
      navigate("/shelter");
    } else if (itemName === "Home") {
      navigate("/");
    } else if (itemName === "Map") {
      navigate("/map");
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
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about" element={<AboutUs />} />
        <Route
          path="/member"
          element={
            <RequireAuth>
              <Member />
            </RequireAuth>
          }
        />
        <Route
          path="/shelter"
          element={
            <RequireAuth>
              <Shelter />
            </RequireAuth>
          }
        />
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
