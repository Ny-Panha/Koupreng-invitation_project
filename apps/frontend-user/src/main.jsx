import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./app/App.jsx";

// Warm the same lazy module while the catalog route resolves its shared chunks.
// This does not render a second invitation or run on owner/public invite routes.
if (location.pathname === '/templates/royal-garden-cinematic') {
  void import('./features/templates/layouts/RoyalGardenCinematic/RoyalGardenCinematicLayout.jsx').catch(() => {});
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
