import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(
    typeof window !== "undefined" && localStorage.getItem("isLoggedIn") === "true"
  );

  useEffect(() => {
    const syncLogin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const loggedIn = session || localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(!!loggedIn);
    };

    syncLogin();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      syncLogin();
    });

    window.addEventListener("storage", syncLogin);

    return () => {
      listener?.subscription?.unsubscribe();
      window.removeEventListener("storage", syncLogin);
    };
  }, []);

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
          {isLoggedIn ? (
            <>
              <button className="btn secondary" onClick={() => navigate("/member")}>
                Member Credential Portal
              </button>
              <button className="btn secondary" onClick={() => navigate("/shelter")}>
                Shelter Registration
              </button>
            </>
          ) : (
            <button className="btn secondary" onClick={() => navigate("/register")}>
              Create Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
