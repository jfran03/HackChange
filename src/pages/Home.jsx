import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-hero">
        <p className="home-pill">Calgary • Community Support</p>
        <h1>
          STREET AID connects people in need with nearby shelters, food, and medical help.
        </h1>
        <p className="home-subtitle">
          Explore the live resource map, send alerts, and access tailored support—built for the
          community by the community.
        </p>
        <div className="home-actions">
          <button className="btn primary" onClick={() => navigate("/map")}>
            View Resource Map
          </button>
          <button className="btn secondary" onClick={() => navigate("/register")}>
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
