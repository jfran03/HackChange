import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { supabase } from "./lib/supabaseClient";

const bootstrap = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    await supabase.auth.signOut({ scope: "local" });
    localStorage.removeItem("isLoggedIn");
  }

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

bootstrap();
