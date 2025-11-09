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
    <main className="home-container">
      <section className="home-hero">
        <p className="home-pill">Calgary • Community Support</p>
        <h1 className="home-title" aria-label="STREET AID">
          <span className="typing-text">STREET AID</span>
          <span className="typing-cursor" aria-hidden="true"></span>
        </h1>
        <p className="home-headline">
          connects people in need with nearby shelters, food, and medical help.
        </p>
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
        <p className="home-meta">No login needed to explore the map or browse resources.</p>
      </section>

      <section className="home-highlights" aria-labelledby="highlights-heading">
        <div className="highlight-grid">
          <article className="highlight-card">
            <div className="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img">
                <path d="M4 10.5L12 5l8 5.5v8.5a1 1 0 0 1-1 1h-6v-5h-2v5H5a1 1 0 0 1-1-1v-8.5z" />
              </svg>
            </div>
            <h3>Safe shelter</h3>
            <p>Live availability and filters make it simple to find a warm bed nearby.</p>
          </article>
          <article className="highlight-card">
            <div className="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img">
                <path d="M12 4a4 4 0 0 1 4 4v2h2a2 2 0 0 1 2 2v7h-4v-4H8v4H4v-7a2 2 0 0 1 2-2h2V8a4 4 0 0 1 4-4z" />
              </svg>
            </div>
            <h3>Health services</h3>
            <p>Locate clinics, harm reduction supports, and mobile outreach within minutes.</p>
          </article>
          <article className="highlight-card">
            <div className="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img">
                <path d="M4 7h16v2H4V7zm2 4h12v2H6v-2zm-2 4h16v2H4v-2z" />
              </svg>
            </div>
            <h3>Meal programs</h3>
            <p>See serving times, dietary options, and travel distance at a glance.</p>
          </article>
        </div>
      </section>

    </main>
  );
};

export default Home;